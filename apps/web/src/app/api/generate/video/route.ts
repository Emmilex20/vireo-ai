import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createVideoJob,
  deductCredits,
  failVideoJob,
  logBlockedPrompt
} from "@vireon/db";
import { getVideoProvider } from "@/lib/ai/providers/registry";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { runGenerationJobInline } from "@/lib/generation/run-inline-generation";
import { isWorkersMode } from "@/lib/runtime/background-mode";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";
import { checkPromptSafety } from "@/lib/security/prompt-safety";
import {
  isReplicateVideoModelId,
  resolveReplicateVideoModel,
} from "@/lib/ai/providers/replicate-video-models";
import {
  getVideoGenerationCost,
  isSupportedVideoDuration,
} from "@/lib/video-generation-config";

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

    if (!isSupportedVideoDuration(normalizedDuration)) {
      return NextResponse.json(
        { error: "Supported video durations are 5, 10, 15, and 20 seconds." },
        { status: 400 }
      );
    }

    const videoCost = getVideoGenerationCost({
      modelId: selectedModel.id,
      duration: normalizedDuration,
      styleStrength,
      motionGuidance,
      fps,
    });

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

    const provider = getVideoProvider();
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

    const providerJob = await provider.createVideoJob({
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
    });

    const job = await createVideoJob({
      userId,
      modelId: selectedModel.id,
      prompt,
      negativePrompt,
      sourceImageUrl: imageUrl,
      sourceAssetId,
      credits: videoCost,
      providerName: provider.name,
      providerJobId: providerJob.providerJobId,
      duration: normalizedDuration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
    });

    try {
      const [wallet] = await deductCredits({
        userId,
        amount: videoCost,
        description: "Video generation",
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
          aspectRatio: job.aspectRatio,
          sourceImageUrl: job.sourceImageUrl,
          sourceAssetId: job.sourceAssetId,
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
          },
        });
      }
    } catch (error) {
      await failVideoJob(
        job.id,
        error instanceof Error && error.message === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits for video generation"
          : "Failed to queue video generation"
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
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 400 }
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
