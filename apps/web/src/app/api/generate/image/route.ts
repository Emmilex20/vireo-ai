import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getImageProvider } from "@/lib/ai/providers/registry";
import {
  safeBuildGenerationContext,
  serializeGenerationContext,
} from "@/lib/ai/generation-context";
import {
  getImageModelUiOptions,
  isUnavailableReplicateImageModelId,
  isReplicateImageModelId,
  resolveReplicateImageModel,
} from "@/lib/ai/providers/replicate-image-models";
import { runGenerationJobInline } from "@/lib/generation/run-inline-generation";
import { isWorkersMode } from "@/lib/runtime/background-mode";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";
import { checkPromptSafety } from "@/lib/security/prompt-safety";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import {
  calculateGenerationCredits,
} from "@/lib/credits/pricing";
import {
  InsufficientCreditsError,
  reserveCredits,
} from "@/lib/credits/credit-service";
import {
  createImageJob,
  failImageJob,
  logBlockedPrompt,
  updateGenerationJobProvider
} from "@vireon/db";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkRedisRateLimit({
      key: `generate:image:${userId}`,
      limit: 20,
      windowSeconds: 60 * 60
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Image generation limit reached. Please try again later.",
          resetAt: limit.resetAt
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    const {
      prompt,
      negativePrompt,
      modelId,
      referenceImageUrl,
      style,
      aspectRatio,
      qualityMode,
      promptBoost,
      seed,
      steps,
      guidance,
    }: {
      prompt?: string;
      negativePrompt?: string;
      modelId?: string;
      referenceImageUrl?: string;
      style?: string;
      aspectRatio?: string;
      qualityMode?: "standard" | "high" | "ultra";
      promptBoost?: boolean;
      seed?: number | null;
      steps?: number;
      guidance?: number;
    } = body;

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (isUnavailableReplicateImageModelId(modelId)) {
      return NextResponse.json(
        {
          error:
            "Kling O1 is currently available as a video model on Replicate, not an image generation model. Choose another image model or switch to Video.",
        },
        { status: 400 }
      );
    }

    if (modelId && !isReplicateImageModelId(modelId)) {
      return NextResponse.json(
        { error: "Unsupported image model selected." },
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
        matchedTerm: safety.matchedTerm
      });

      return NextResponse.json(
        {
          error: safety.reason
        },
        { status: 400 }
      );
    }

    const provider = getImageProvider();
    const workersMode = await isWorkersMode();
    const selectedModel = resolveReplicateImageModel(modelId);
    const modelOptions = getImageModelUiOptions(selectedModel);

    if (referenceImageUrl && !selectedModel.supports.referenceImage) {
      return NextResponse.json(
        {
          error: `${selectedModel.label} does not support reference image uploads.`,
        },
        { status: 400 }
      );
    }

    if (
      aspectRatio &&
      !modelOptions.aspectRatios.includes(aspectRatio)
    ) {
      return NextResponse.json(
        {
          error: `${selectedModel.label} supports ${modelOptions.aspectRatios.join(
            ", "
          )} aspect ratios.`,
        },
        { status: 400 }
      );
    }

    const generationContext = safeBuildGenerationContext(
      {
        rawPrompt: prompt,
        generationMode: "image",
        providerName: provider.name,
        modelId: selectedModel.id,
        negativePrompt,
        style,
        aspectRatio,
      },
      "api/generate/image"
    );
    const serializedGenerationContext =
      serializeGenerationContext(generationContext);

    const imageQuote = calculateGenerationCredits({
      generationType: "image",
      modelId: selectedModel.id,
      prompt,
      referenceImageUrl,
      qualityMode,
      numberOfOutputs: 1,
    });
    const imageCost = imageQuote.credits;

    const job = await createImageJob({
      userId,
      prompt,
      negativePrompt: generationContext.negativePrompt,
      modelId: selectedModel.id,
      sourceImageUrl: referenceImageUrl,
      credits: imageCost,
      providerName: provider.name,
      style,
      aspectRatio,
      qualityMode,
      promptBoost,
      seed,
      steps,
      guidance,
      settings: {
        generationContext: serializedGenerationContext,
      },
    });

    try {
      const { wallet } = await reserveCredits({
        userId,
        amount: imageCost,
        generationId: job.id,
        reason: "Image generation",
        metadata: {
          quote: imageQuote,
          modelId: selectedModel.id,
          generationType: "image",
        },
      });

      await sendLowCreditsEmailIfNeeded({
        userId,
        balance: wallet.balance
      });

      const providerJob = await provider.createImageJob({
        prompt: generationContext.finalPrompt,
        negativePrompt: generationContext.negativePrompt,
        modelId: selectedModel.id,
        referenceImageUrl,
        style,
        aspectRatio,
        qualityMode,
        promptBoost,
        seed,
        steps,
        guidance,
      });

      const queuedJob = await updateGenerationJobProvider({
        jobId: job.id,
        providerName: provider.name,
        providerJobId: providerJob.providerJobId,
      });

      if (workersMode) {
        const { enqueueGenerationJob } = await import(
          "@/lib/queue/generation-queue"
        );
        await enqueueGenerationJob(job.id);
        return NextResponse.json({
          success: true,
          jobId: queuedJob.id,
          status: queuedJob.status,
          providerName: queuedJob.providerName,
          providerJobId: queuedJob.providerJobId,
          meta: {
            modelId: selectedModel.id,
            referenceImageUrl: referenceImageUrl ?? null,
            style: style ?? "Cinematic",
            aspectRatio: aspectRatio ?? selectedModel.defaultAspectRatio,
            qualityMode: qualityMode ?? "high",
            promptBoost: promptBoost ?? true,
            seed: seed ?? null,
            steps: steps ?? 30,
            guidance: guidance ?? 7.5,
            credits: imageCost,
            creditBreakdown: imageQuote.breakdown,
          },
        });
      } else {
        const finalJob = await runGenerationJobInline({
          id: job.id,
          userId: job.userId,
          type: job.type,
          status: job.status,
          providerName: queuedJob.providerName,
          providerJobId: queuedJob.providerJobId,
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
          settings: job.settings
        });

        return NextResponse.json({
          success: true,
          jobId: finalJob.id,
          status: finalJob.status,
          outputUrl: finalJob.outputUrl ?? null,
          failureReason: finalJob.failureReason ?? null,
          providerName: finalJob.providerName,
          providerJobId: finalJob.providerJobId,
          inlineProcessed: true,
          meta: {
            modelId: selectedModel.id,
            referenceImageUrl: referenceImageUrl ?? null,
            style: style ?? "Cinematic",
            aspectRatio: aspectRatio ?? selectedModel.defaultAspectRatio,
            qualityMode: qualityMode ?? "high",
            promptBoost: promptBoost ?? true,
            seed: seed ?? null,
            steps: steps ?? 30,
            guidance: guidance ?? 7.5,
            credits: imageCost,
            creditBreakdown: imageQuote.breakdown,
          },
        });
      }
    } catch (error) {
      await failImageJob(
        job.id,
        error instanceof Error && error.message === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits for image generation"
          : "Failed to queue image generation"
      );
      throw error;
    }

    throw new Error("Failed to queue image generation");
  } catch (error: unknown) {
    if (
      error instanceof InsufficientCreditsError ||
      (error instanceof Error && error.message === "INSUFFICIENT_CREDITS")
    ) {
      const requiredCredits =
        error instanceof InsufficientCreditsError ? error.requiredCredits : 0;
      const availableCredits =
        error instanceof InsufficientCreditsError ? error.availableCredits : 0;
      return NextResponse.json(
        {
          error: "INSUFFICIENT_CREDITS",
          requiredCredits,
          availableCredits,
          message: `You need ${requiredCredits} credits to run this generation.`,
        },
        { status: 402 }
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

    if (
      error instanceof Error &&
      error.message === "REPLICATE_API_TOKEN is not set"
    ) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not set" },
        { status: 500 }
      );
    }

    console.error("[api/generate/image] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to create image job",
        ...(process.env.NODE_ENV !== "production"
          ? {
              debug:
                error instanceof Error ? error.message : String(error),
            }
          : {}),
      },
      { status: 500 }
    );
  }
}
