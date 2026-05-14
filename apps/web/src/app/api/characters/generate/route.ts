import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getImageProvider } from "@/lib/ai/providers/registry";
import {
  safeBuildGenerationContext,
  serializeGenerationContext,
} from "@/lib/ai/generation-context";
import {
  buildCharacterPrompt,
  buildCharacterTitle,
  getCharacterGenerationCost,
  normalizeCharacterCount,
  resolveCharacterGenerationModelId,
  type CharacterGenerationMode,
} from "@/lib/characters/character-generation";
import { runGenerationJobInline } from "@/lib/generation/run-inline-generation";
import { isWorkersMode } from "@/lib/runtime/background-mode";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";
import { checkPromptSafety } from "@/lib/security/prompt-safety";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import {
  createCharacter,
  createImageJob,
  deductCreditsForGenerationJobs,
  failImageJob,
  logBlockedPrompt,
  updateCharacterGenerationResult,
} from "@vireon/db";

export const maxDuration = 300;

type CharacterGenerateBody = {
  mode?: CharacterGenerationMode;
  name?: string;
  modelId?: string;
  description?: string;
  backgroundStory?: string;
  sourceImageUrl?: string;
  style?: string;
  vibe?: string;
  gender?: string;
  ethnicity?: string;
  ageRange?: string;
  count?: number;
};

function isCharacterMode(value: unknown): value is CharacterGenerationMode {
  return value === "image" || value === "describe" || value === "builder";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getReplicateRetryAfterSeconds(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const jsonMatch = message.match(/"retry_after"\s*:\s*(\d+)/);
  const textMatch = message.match(/resets in ~?(\d+)s/i);
  const parsed = Number(jsonMatch?.[1] ?? textMatch?.[1]);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

function isReplicateRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("status 429") ||
    message.includes("Too Many Requests") ||
    message.includes("Request was throttled")
  );
}

async function createProviderImageJobWithRateLimitRetry<T>(
  createJob: () => Promise<T>
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await createJob();
    } catch (error) {
      lastError = error;

      if (!isReplicateRateLimitError(error) || attempt === 3) {
        throw error;
      }

      const retryAfterSeconds = getReplicateRetryAfterSeconds(error);
      await sleep((retryAfterSeconds + 1) * 1000);
    }
  }

  throw lastError;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkRedisRateLimit({
      key: `generate:character:${userId}`,
      limit: 12,
      windowSeconds: 60 * 60,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Character generation limit reached. Please try again later.",
          resetAt: limit.resetAt,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as CharacterGenerateBody;
    const mode = isCharacterMode(body.mode) ? body.mode : "describe";
    const modelId = resolveCharacterGenerationModelId(body.modelId);
    const count = normalizeCharacterCount(body.count);
    const name = buildCharacterTitle(body);
    const prompt = buildCharacterPrompt({ ...body, mode, name, count });
    const negativePrompt =
      "blurry, low quality, bad anatomy, extra limbs, duplicate face, distorted face, watermark, text, logo, unrelated person";

    if (mode === "image" && !body.sourceImageUrl) {
      return NextResponse.json(
        { error: "Start from image requires a source image." },
        { status: 400 }
      );
    }

    if (prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Character prompt must be at least 5 characters." },
        { status: 400 }
      );
    }

    const safety = checkPromptSafety(prompt, negativePrompt);

    if (!safety.allowed) {
      await logBlockedPrompt({
        userId,
        prompt,
        negativePrompt,
        reason: safety.reason!,
        matchedTerm: safety.matchedTerm,
      });

      return NextResponse.json({ error: safety.reason }, { status: 400 });
    }

    const credits = getCharacterGenerationCost(count);
    const creditsPerCharacter = getCharacterGenerationCost(1);
    const provider = getImageProvider();
    const workersMode = await isWorkersMode();
    const generationRecords = [];

    try {
      for (let index = 0; index < count; index += 1) {
        const variantNumber = index + 1;
        const variantPrompt =
          count === 1
            ? buildCharacterPrompt({ ...body, mode, name, count: 1 })
            : `${buildCharacterPrompt({
                ...body,
                mode,
                name: `${name} ${variantNumber}`,
                count: 1,
              })} Create distinct option ${variantNumber} of ${count}: keep the same brief, but vary the face, styling details, color language, and silhouette enough that this is a separate selectable character.`;
        const generationContext = safeBuildGenerationContext(
          {
            rawPrompt: variantPrompt,
            generationMode: "character",
            providerName: provider.name,
            modelId,
            negativePrompt,
            style: body.style ?? "Photorealistic character reference",
            aspectRatio: "1:1",
          },
          "api/characters/generate"
        );
        const serializedGenerationContext =
          serializeGenerationContext(generationContext);

        const providerJob = await createProviderImageJobWithRateLimitRetry(() =>
          provider.createImageJob({
            prompt: generationContext.finalPrompt,
            negativePrompt: generationContext.negativePrompt,
            modelId,
            referenceImageUrl: body.sourceImageUrl,
            style: body.style ?? "Photorealistic character reference",
            aspectRatio: "1:1",
            qualityMode: "ultra",
            promptBoost: true,
          })
        );

        const job = await createImageJob({
          userId,
          prompt: variantPrompt,
          negativePrompt: generationContext.negativePrompt,
          modelId,
          sourceImageUrl: body.sourceImageUrl,
          credits: creditsPerCharacter,
          providerName: provider.name,
          providerJobId: providerJob.providerJobId,
          style: body.style ?? "Photorealistic character reference",
          aspectRatio: "1:1",
          qualityMode: "ultra",
          promptBoost: true,
          settings: {
            generationContext: serializedGenerationContext,
          },
        });

        const character = await createCharacter({
          userId,
          generationJobId: job.id,
          name: count === 1 ? name : `${name} ${variantNumber}`,
          description: body.description,
          backgroundStory: body.backgroundStory,
          mode,
          status: "processing",
          modelId,
          prompt: variantPrompt,
          sourceImageUrl: body.sourceImageUrl,
          style: body.style ?? "Photorealistic",
          vibe: body.vibe,
          gender: body.gender,
          ethnicity: body.ethnicity,
          ageRange: body.ageRange,
          count: 1,
          creditsUsed: creditsPerCharacter,
        });

        generationRecords.push({ job, character });

        if (index < count - 1) {
          await sleep(11000);
        }
      }
    } catch (error) {
      const failureReason = isReplicateRateLimitError(error)
        ? "Replicate is rate limiting character generation. Please wait a few seconds and try again."
        : "Failed to create character generation";

      await Promise.all(
        generationRecords.map(async ({ job, character }) => {
          await failImageJob(job.id, failureReason);
          await updateCharacterGenerationResult({
            characterId: character.id,
            userId,
            status: "failed",
            failureReason,
          });
        })
      );

      throw error;
    }

    try {
      const [wallet] = await deductCreditsForGenerationJobs({
        userId,
        description: "Character generation",
        jobs: generationRecords.map(({ job }, index) => ({
          generationJobId: job.id,
          amount: creditsPerCharacter,
          description:
            count === 1
              ? "Character generation"
              : `Character generation ${index + 1}/${count}`,
        })),
      });

      await sendLowCreditsEmailIfNeeded({
        userId,
        balance: wallet.balance,
      });

      if (workersMode) {
        const { enqueueGenerationJob } = await import(
          "@/lib/queue/generation-queue"
        );
        await Promise.all(
          generationRecords.map(({ job }) => enqueueGenerationJob(job.id))
        );
      } else {
        const processed = await Promise.all(
          generationRecords.map(async ({ job, character }) => {
            const finalJob = await runGenerationJobInline({
              id: job.id,
              userId: job.userId,
              type: job.type,
              status: job.status,
              providerName: job.providerName,
              providerJobId: job.providerJobId,
              prompt: job.prompt,
              negativePrompt: job.negativePrompt,
              sourceImageUrl: job.sourceImageUrl,
              style: job.style,
              aspectRatio: job.aspectRatio,
              qualityMode: job.qualityMode,
              promptBoost: job.promptBoost,
              seed: job.seed,
              steps: job.steps,
              guidance: job.guidance,
              settings: job.settings,
            });

            const updatedCharacter = await updateCharacterGenerationResult({
              characterId: character.id,
              userId,
              status: finalJob.status === "completed" ? "completed" : "failed",
              imageUrl: finalJob.outputUrl ?? null,
              failureReason: finalJob.failureReason ?? null,
            });

            return { finalJob, character: updatedCharacter };
          })
        );
        const characters = processed.map((item) => item.character);
        const firstJob = processed[0]?.finalJob;

        return NextResponse.json({
          success: processed.some(
            (item) => item.finalJob.status === "completed"
          ),
          character: characters[0] ?? null,
          characters,
          jobId: firstJob?.id ?? null,
          jobIds: processed.map((item) => item.finalJob.id),
          status: processed.every((item) => item.finalJob.status === "completed")
            ? "completed"
            : processed.some((item) => item.finalJob.status === "processing")
              ? "processing"
              : "failed",
          outputUrl: firstJob?.outputUrl ?? null,
          outputUrls: processed
            .map((item) => item.finalJob.outputUrl)
            .filter(Boolean),
          failureReason: firstJob?.failureReason ?? null,
          inlineProcessed: true,
        });
      }
    } catch (error) {
      const failureReason =
        error instanceof Error && error.message === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits for character generation"
          : "Failed to queue character generation";

      await Promise.all(
        generationRecords.map(async ({ job, character }) => {
          await failImageJob(job.id, failureReason);
          await updateCharacterGenerationResult({
            characterId: character.id,
            userId,
            status: "failed",
            failureReason,
          });
        })
      );

      throw error;
    }

    return NextResponse.json({
      success: true,
      character: generationRecords[0]?.character ?? null,
      characters: generationRecords.map((record) => record.character),
      jobId: generationRecords[0]?.job.id ?? null,
      jobIds: generationRecords.map((record) => record.job.id),
      status: "processing",
      meta: {
        modelId,
        credits,
        count,
      },
    });
  } catch (error: unknown) {
    if (isReplicateRateLimitError(error)) {
      const retryAfter = getReplicateRetryAfterSeconds(error);

      return NextResponse.json(
        {
          error:
            "Replicate is temporarily rate limiting character generation. Please try again shortly, or generate fewer characters at once.",
          retryAfter,
        },
        { status: 429 }
      );
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes("Insufficient credit") ||
        error.message.includes("402 Payment Required"))
    ) {
      return NextResponse.json(
        {
          error:
            "Replicate account has insufficient credit to run this model. Add billing credit in Replicate and try again.",
        },
        { status: 400 }
      );
    }

    console.error("[api/characters/generate] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to create character generation",
        ...(process.env.NODE_ENV !== "production"
          ? { debug: error instanceof Error ? error.message : String(error) }
          : {}),
      },
      { status: 500 }
    );
  }
}
