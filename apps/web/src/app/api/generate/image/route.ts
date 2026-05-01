import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getImageProvider } from "@/lib/ai/providers/registry";
import {
  getImageModelUiOptions,
  isReplicateImageModelId,
  resolveReplicateImageModel,
} from "@/lib/ai/providers/replicate-image-models";
import { runGenerationJobInline } from "@/lib/generation/run-inline-generation";
import { getImageGenerationCost } from "@/lib/image-generation-config";
import { isWorkersMode } from "@/lib/runtime/background-mode";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";
import { checkPromptSafety } from "@/lib/security/prompt-safety";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import {
  createImageJob,
  deductCredits,
  failImageJob,
  logBlockedPrompt
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

    const imageCost = getImageGenerationCost({
      modelId: selectedModel.id,
      qualityMode,
      seed,
      steps,
      guidance,
    });

    const providerJob = await provider.createImageJob({
      prompt,
      negativePrompt,
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

    const job = await createImageJob({
      userId,
      prompt,
      negativePrompt,
      modelId: selectedModel.id,
      sourceImageUrl: referenceImageUrl,
      credits: imageCost,
      providerName: provider.name,
      providerJobId: providerJob.providerJobId,
      style,
      aspectRatio,
      qualityMode,
      promptBoost,
      seed,
      steps,
      guidance,
    });

    try {
      const [wallet] = await deductCredits({
        userId,
        amount: imageCost,
        description: "Image generation",
        generationJobId: job.id,
      });

      await sendLowCreditsEmailIfNeeded({
        userId,
        balance: wallet.balance
      });

      if (workersMode) {
        const { enqueueGenerationJob } = await import(
          "@/lib/queue/generation-queue"
        );
        await enqueueGenerationJob(job.id);
      } else {
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
          guidance: job.guidance
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

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      providerName: job.providerName,
      providerJobId: job.providerJobId,
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
      },
    });
  } catch (error: unknown) {
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
