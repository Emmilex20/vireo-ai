import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createVideoJob,
  failVideoJob,
  logBlockedPrompt,
  markGenerationFailover,
  updateGenerationJobProvider
} from "@vireon/db";
import {
  getVideoProvider,
  getVideoProviderByName,
} from "@/lib/ai/providers/registry";
import {
  getFallbackProviderName,
  getProviderErrorMessage,
  shouldFallbackProviderFailure,
} from "@/lib/ai/providers/failover";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { runGenerationJobInline } from "@/lib/generation/run-inline-generation";
import {
  calculateGenerationCredits,
} from "@/lib/credits/pricing";
import {
  InsufficientCreditsError,
  reserveCredits,
} from "@/lib/credits/credit-service";
import { isWorkersMode } from "@/lib/runtime/background-mode";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";
import { checkPromptSafety } from "@/lib/security/prompt-safety";
import {
  getVideoModelUiOptions,
  isReplicateVideoModelId,
  resolveReplicateVideoModel,
} from "@/lib/ai/providers/replicate-video-models";
import { isSupportedVideoDuration } from "@/lib/video-generation-config";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkRedisRateLimit({
      key: `generate:video:${userId}`,
      limit: 10,
      windowSeconds: 60 * 60
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Video generation limit reached. Please try again later.",
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
      providerName,
      resolution,
      draft,
      saveAudio,
      promptUpsampling,
      disableSafetyFilter,
      noOp,
      seed,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      imageUrl,
      endImageUrl,
      referenceImageUrls,
      audioUrl,
      sourceAssetId
    }: {
      prompt?: string;
      negativePrompt?: string;
      modelId?: string;
      providerName?: string;
      resolution?: string;
      draft?: boolean;
      saveAudio?: boolean;
      promptUpsampling?: boolean;
      disableSafetyFilter?: boolean;
      noOp?: boolean;
      seed?: number;
      duration?: number;
      aspectRatio?: string;
      motionIntensity?: string;
      cameraMove?: string;
      styleStrength?: string;
      motionGuidance?: number;
      shotType?: string;
      fps?: number;
      imageUrl?: string;
      endImageUrl?: string;
      referenceImageUrls?: string[];
      audioUrl?: string;
      sourceAssetId?: string;
    } = body;

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (modelId && !isReplicateVideoModelId(modelId)) {
      return NextResponse.json(
        { error: "Unsupported video model selected." },
        { status: 400 }
      );
    }

    const normalizedDuration = duration ?? 5;
    const selectedModel = resolveReplicateVideoModel(modelId);

    const modelOptions = getVideoModelUiOptions(selectedModel);

    if (
      !isSupportedVideoDuration(normalizedDuration) ||
      !modelOptions.durations.includes(normalizedDuration)
    ) {
      return NextResponse.json(
        {
          error: `${selectedModel.label} supports ${modelOptions.durations
            .map((value) => `${value}s`)
            .join(", ")} durations.`,
        },
        { status: 400 }
      );
    }

    if (aspectRatio && !modelOptions.aspectRatios.includes(aspectRatio)) {
      return NextResponse.json(
        {
          error: `${selectedModel.label} supports ${modelOptions.aspectRatios.join(
            ", "
          )} aspect ratios.`,
        },
        { status: 400 }
      );
    }

    if (
      resolution &&
      modelOptions.resolutions.length &&
      !modelOptions.resolutions.includes(resolution)
    ) {
      return NextResponse.json(
        {
          error: `${selectedModel.label} supports ${modelOptions.resolutions.join(
            ", "
          )} resolutions.`,
        },
        { status: 400 }
      );
    }

    const videoQuote = calculateGenerationCredits({
      generationType: "video",
      modelId: selectedModel.id,
      prompt,
      durationSeconds: normalizedDuration,
      resolution,
      numberOfOutputs: 1,
      imageToVideo: Boolean(imageUrl),
      imageUrl,
      endImageUrl,
      referenceImageUrls,
      audioUrl,
    });
    const videoCost = videoQuote.credits;

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

    const provider =
      providerName === "kling-video" || providerName === "replicate-video"
        ? getVideoProviderByName(providerName)
        : getVideoProvider();
    const workersMode = await isWorkersMode();
    const supportsEndFrame = selectedModel.features.includes("Start/End");
    const supportsReferences =
      selectedModel.features.includes("Reference") ||
      selectedModel.features.includes("Multi-shots");

    if (imageUrl && !selectedModel.supports.imageInput) {
      return NextResponse.json(
        { error: `${selectedModel.label} does not support source images.` },
        { status: 400 }
      );
    }

    if (endImageUrl && !supportsEndFrame) {
      return NextResponse.json(
        { error: `${selectedModel.label} does not support end frames.` },
        { status: 400 }
      );
    }

    if (referenceImageUrls?.length && !supportsReferences) {
      return NextResponse.json(
        { error: `${selectedModel.label} does not support visual references.` },
        { status: 400 }
      );
    }

    if (audioUrl && !selectedModel.supports.audioGeneration) {
      return NextResponse.json(
        { error: `${selectedModel.label} does not support audio references.` },
        { status: 400 }
      );
    }

    const job = await createVideoJob({
      userId,
      modelId: selectedModel.id,
      prompt,
      negativePrompt,
      sourceImageUrl: imageUrl,
      sourceAssetId,
      credits: videoCost,
      providerName: provider.name,
      duration: normalizedDuration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      settings: {
        modelId: selectedModel.id,
        resolution: resolution ?? null,
        draft: draft ?? null,
        saveAudio: saveAudio ?? null,
        promptUpsampling: promptUpsampling ?? null,
        disableSafetyFilter: disableSafetyFilter ?? null,
        noOp: noOp ?? null,
        seed: seed ?? null,
        endImageUrl: supportsEndFrame ? endImageUrl ?? null : null,
        referenceImageUrls: supportsReferences ? referenceImageUrls ?? [] : [],
        audioUrl: selectedModel.supports.audioGeneration ? audioUrl ?? null : null,
      },
    });

    try {
      const { wallet } = await reserveCredits({
        userId,
        amount: videoCost,
        generationId: job.id,
        reason: "Video generation",
        metadata: {
          quote: videoQuote,
          modelId: selectedModel.id,
          generationType: "video",
        },
      });

      await sendLowCreditsEmailIfNeeded({
        userId,
        balance: wallet.balance
      });

      const videoProviderInput = {
        prompt,
        negativePrompt,
        modelId: selectedModel.id,
        resolution,
        draft,
        saveAudio,
        promptUpsampling,
        disableSafetyFilter,
        noOp,
        seed,
        duration: normalizedDuration,
        aspectRatio,
        motionIntensity,
        cameraMove,
        styleStrength,
        motionGuidance,
        shotType,
        fps,
        imageUrl,
        endImageUrl: supportsEndFrame ? endImageUrl : undefined,
        referenceImageUrls: supportsReferences ? referenceImageUrls : undefined,
        audioUrl: selectedModel.supports.audioGeneration ? audioUrl : undefined
      };

      let queuedJob: Awaited<ReturnType<typeof updateGenerationJobProvider>>;

      try {
        const providerJob = await provider.createVideoJob(videoProviderInput);

        queuedJob = await updateGenerationJobProvider({
          jobId: job.id,
          providerName: provider.name,
          providerJobId: providerJob.providerJobId,
        });
      } catch (primaryError) {
        if (!shouldFallbackProviderFailure({ error: primaryError })) {
          throw primaryError;
        }

        const fallbackName = getFallbackProviderName({
          type: "video",
          currentProviderName: provider.name,
        });

        if (!fallbackName || fallbackName === provider.name) {
          throw primaryError;
        }

        const fallbackProvider = getVideoProviderByName(fallbackName);
        let fallbackJob;

        try {
          fallbackJob = await fallbackProvider.createVideoJob(videoProviderInput);
        } catch (fallbackError) {
          throw new Error(
            `${provider.name} failed to queue: ${getProviderErrorMessage(
              primaryError
            )}. ${fallbackProvider.name} fallback failed: ${getProviderErrorMessage(
              fallbackError
            )}`
          );
        }

        queuedJob = await markGenerationFailover({
          jobId: job.id,
          fallbackProviderName: fallbackProvider.name,
          fallbackProviderJobId: fallbackJob.providerJobId,
          reason: getProviderErrorMessage(primaryError),
        });
      }

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
            duration: normalizedDuration,
            aspectRatio: aspectRatio ?? "16:9",
            motionIntensity: motionIntensity ?? "medium",
            cameraMove: cameraMove ?? "Slow Push In",
            styleStrength: styleStrength ?? "medium",
            motionGuidance: motionGuidance ?? 6,
            shotType: shotType ?? "Wide Shot",
            fps: fps ?? 24,
            resolution: resolution ?? null,
            draft: draft ?? false,
            modelId: selectedModel.id,
            credits: videoCost,
            creditBreakdown: videoQuote.breakdown,
          },
        });
      } else {
        const finalJob = await runGenerationJobInline({
          id: job.id,
          userId: job.userId,
          modelId: job.modelId,
          type: job.type,
          status: job.status,
          providerName: queuedJob.providerName,
          providerJobId: queuedJob.providerJobId,
          prompt: job.prompt,
          negativePrompt: job.negativePrompt,
          aspectRatio: job.aspectRatio,
          sourceImageUrl: job.sourceImageUrl,
          sourceAssetId: job.sourceAssetId,
          settings: job.settings,
          duration: job.duration,
          motionIntensity: job.motionIntensity,
          cameraMove: job.cameraMove,
          styleStrength: job.styleStrength,
          motionGuidance: job.motionGuidance,
          shotType: job.shotType,
          fps: job.fps
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
            duration: normalizedDuration,
            aspectRatio: aspectRatio ?? "16:9",
            motionIntensity: motionIntensity ?? "medium",
            cameraMove: cameraMove ?? "Slow Push In",
            styleStrength: styleStrength ?? "medium",
            motionGuidance: motionGuidance ?? 6,
            shotType: shotType ?? "Wide Shot",
            fps: fps ?? 24,
            resolution: resolution ?? null,
            draft: draft ?? false,
            modelId: selectedModel.id,
            credits: videoCost,
            creditBreakdown: videoQuote.breakdown,
          },
        });
      }
    } catch (error) {
      await failVideoJob(
        job.id,
        error instanceof Error && error.message === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits for video generation"
          : getProviderErrorMessage(error)
      );
      throw error;
    }

    throw new Error("Failed to queue video generation");
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

    console.error("[api/generate/video] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to create video job",
        ...(process.env.NODE_ENV !== "production"
          ? { debug: error instanceof Error ? error.message : String(error) }
          : {}),
      },
      { status: 500 }
    );
  }
}
