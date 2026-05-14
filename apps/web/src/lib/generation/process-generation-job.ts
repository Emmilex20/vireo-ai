import {
  completeAudioJob,
  completeImageJob,
  completeVideoJob,
  failAudioJob,
  failImageJob,
  failVideoJob,
  markGenerationFailover
} from "@vireon/db";
import {
  getFallbackProviderName,
  shouldFallbackProviderFailure
} from "@/lib/ai/providers/failover";
import {
  getAudioProviderByName,
  getImageProviderByName,
  getVideoProviderByName
} from "@/lib/ai/providers/registry";
import { sendGenerationFailedEmailNotification } from "@/lib/email/notifications";
import { captureReservedCredits } from "@/lib/credits/credit-service";
import { uploadRemoteAssetToCloudinary } from "@/lib/storage/cloudinary";

export type ProcessableGenerationJob = {
  id: string;
  userId: string;
  type: string;
  status: string;
  modelId?: string | null;
  providerName?: string | null;
  providerJobId?: string | null;
  prompt?: string | null;
  negativePrompt?: string | null;
  style?: string | null;
  aspectRatio?: string | null;
  qualityMode?: string | null;
  promptBoost?: boolean | null;
  seed?: number | null;
  steps?: number | null;
  guidance?: number | null;
  duration?: number | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  sourceImageUrl?: string | null;
  sourceAssetId?: string | null;
  settings?: unknown;
};

type StoredVideoSettings = {
  modelId?: string;
  resolution?: string;
  draft?: boolean;
  saveAudio?: boolean;
  promptUpsampling?: boolean;
  disableSafetyFilter?: boolean;
  noOp?: boolean;
  seed?: number | null;
  endImageUrl?: string;
  referenceImageUrls?: string[];
  audioUrl?: string;
  generationContext?: StoredGenerationContext;
};

type StoredGenerationContext = {
  finalPrompt?: unknown;
  negativePrompt?: unknown;
};

function readStoredVideoSettings(settings: unknown): StoredVideoSettings {
  if (!settings || typeof settings !== "object") {
    return {};
  }

  return settings as StoredVideoSettings;
}

function readStoredGenerationContext(settings: unknown): StoredGenerationContext {
  if (!settings || typeof settings !== "object") {
    return {};
  }

  const generationContext = (settings as { generationContext?: unknown })
    .generationContext;

  if (!generationContext || typeof generationContext !== "object") {
    return {};
  }

  return generationContext as StoredGenerationContext;
}

function cleanStoredText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function getProviderPrompt(job: ProcessableGenerationJob) {
  const generationContext = readStoredGenerationContext(job.settings);
  const finalPrompt = cleanStoredText(generationContext.finalPrompt);
  const negativePrompt = cleanStoredText(generationContext.negativePrompt);

  return {
    prompt: finalPrompt || job.prompt || "",
    negativePrompt: negativePrompt || job.negativePrompt || undefined,
  };
}

type ProcessedGenerationJob =
  | ProcessableGenerationJob
  | Awaited<ReturnType<typeof completeAudioJob>>
  | Awaited<ReturnType<typeof completeImageJob>>
  | Awaited<ReturnType<typeof completeVideoJob>>
  | Awaited<ReturnType<typeof failAudioJob>>
  | Awaited<ReturnType<typeof failImageJob>>
  | Awaited<ReturnType<typeof failVideoJob>>;

export type GenerationProcessResult = {
  status: "processing" | "completed" | "failed";
  job: ProcessedGenerationJob;
};

export async function processGenerationJob(
  job: ProcessableGenerationJob
): Promise<GenerationProcessResult> {
  if (!job.providerJobId) {
    return {
      status: "processing",
      job
    };
  }

  if (job.type === "image") {
    const provider = getImageProviderByName(job.providerName);
    const status = await provider.getImageJobStatus(job.providerJobId);

    if (status.status === "completed" && status.outputUrl) {
      const storageResult = await uploadRemoteAssetToCloudinary({
        url: status.outputUrl,
        folder: "vireon/images",
        resourceType: "image"
      });

      const completedJob = await completeImageJob({
        jobId: job.id,
        outputUrl: storageResult.url,
        storageProvider: storageResult.stored ? "cloudinary" : "provider",
        storageUrl: storageResult.url,
        storageStatus: storageResult.stored ? "stored" : "fallback",
        storageReason: storageResult.reason,
        storagePublicId: storageResult.publicId
      });

      await captureReservedCredits({
        userId: completedJob.userId,
        amount: completedJob.creditsUsed,
        generationId: completedJob.id,
        reason: "Image generation completed"
      });

      return {
        status: "completed",
        job: completedJob
      };
    }

    if (status.status === "failed") {
      const fallbackName = getFallbackProviderName({
        type: "image",
        currentProviderName: job.providerName
      });

      if (fallbackName && fallbackName !== job.providerName) {
        const fallbackProvider = getImageProviderByName(fallbackName);
        const providerPrompt = getProviderPrompt(job);
        const fallbackJob = await fallbackProvider.createImageJob({
          prompt: providerPrompt.prompt,
          negativePrompt: providerPrompt.negativePrompt,
          referenceImageUrl: job.sourceImageUrl ?? undefined,
          style: job.style ?? undefined,
          aspectRatio: job.aspectRatio ?? undefined,
          qualityMode: job.qualityMode ?? undefined,
          promptBoost: job.promptBoost ?? undefined,
          seed: job.seed ?? undefined,
          steps: job.steps ?? undefined,
          guidance: job.guidance ?? undefined
        });

        const updatedJob = await markGenerationFailover({
          jobId: job.id,
          fallbackProviderName: fallbackProvider.name,
          fallbackProviderJobId: fallbackJob.providerJobId,
          reason: status.error || "Primary image provider failed"
        });

        return {
          status: "processing",
          job: updatedJob
        };
      }

      const failedJob = await failImageJob(
        job.id,
        status.error || "Image provider generation failed"
      );

      await sendGenerationFailedEmailNotification(job.userId);

      return {
        status: "failed",
        job: failedJob
      };
    }

    return {
      status: "processing",
      job
    };
  }

  if (job.type === "video") {
    const provider = getVideoProviderByName(job.providerName);
    const status = await provider.getVideoJobStatus(job.providerJobId);

    if (status.status === "completed" && status.outputUrl) {
      const storageResult = await uploadRemoteAssetToCloudinary({
        url: status.outputUrl,
        folder: "vireon/videos",
        resourceType: "video"
      });

      const completedJob = await completeVideoJob({
        jobId: job.id,
        outputUrl: storageResult.url,
        storageProvider: storageResult.stored ? "cloudinary" : "provider",
        storageUrl: storageResult.url,
        storageStatus: storageResult.stored ? "stored" : "fallback",
        storageReason: storageResult.reason,
        storagePublicId: storageResult.publicId
      });

      await captureReservedCredits({
        userId: completedJob.userId,
        amount: completedJob.creditsUsed,
        generationId: completedJob.id,
        reason: "Video generation completed"
      });

      return {
        status: "completed",
        job: completedJob
      };
    }

    if (status.status === "failed") {
      const fallbackName = getFallbackProviderName({
        type: "video",
        currentProviderName: job.providerName
      });

      if (
        shouldFallbackProviderFailure({ reason: status.error }) &&
        fallbackName &&
        fallbackName !== job.providerName
      ) {
        const fallbackProvider = getVideoProviderByName(fallbackName);
        const settings = readStoredVideoSettings(job.settings);
        const providerPrompt = getProviderPrompt(job);
        const fallbackJob = await fallbackProvider.createVideoJob({
          prompt: providerPrompt.prompt,
          negativePrompt: providerPrompt.negativePrompt,
          modelId: settings.modelId ?? job.modelId ?? undefined,
          resolution: settings.resolution,
          draft: settings.draft,
          saveAudio: settings.saveAudio,
          promptUpsampling: settings.promptUpsampling,
          disableSafetyFilter: settings.disableSafetyFilter,
          noOp: settings.noOp,
          seed: settings.seed,
          duration: job.duration ?? undefined,
          aspectRatio: job.aspectRatio ?? undefined,
          motionIntensity: job.motionIntensity ?? undefined,
          cameraMove: job.cameraMove ?? undefined,
          styleStrength: job.styleStrength ?? undefined,
          motionGuidance: job.motionGuidance ?? undefined,
          shotType: job.shotType ?? undefined,
          fps: job.fps ?? undefined,
          imageUrl: job.sourceImageUrl ?? undefined,
          endImageUrl: settings.endImageUrl,
          referenceImageUrls: settings.referenceImageUrls,
          audioUrl: settings.audioUrl
        });

        const updatedJob = await markGenerationFailover({
          jobId: job.id,
          fallbackProviderName: fallbackProvider.name,
          fallbackProviderJobId: fallbackJob.providerJobId,
          reason: status.error || "Primary video provider failed"
        });

        return {
          status: "processing",
          job: updatedJob
        };
      }

      const failedJob = await failVideoJob(
        job.id,
        status.error || "Video provider generation failed"
      );

      await sendGenerationFailedEmailNotification(job.userId);

      return {
        status: "failed",
        job: failedJob
      };
    }

    return {
      status: "processing",
      job
    };
  }

  if (job.type === "audio") {
    const provider = getAudioProviderByName(job.providerName);
    const status = await provider.getAudioJobStatus(job.providerJobId);

    if (status.status === "completed" && status.outputUrl) {
      const storageResult = await uploadRemoteAssetToCloudinary({
        url: status.outputUrl,
        folder: "vireon/audio",
        resourceType: "video"
      });

      const completedJob = await completeAudioJob({
        jobId: job.id,
        outputUrl: storageResult.url,
        storageProvider: storageResult.stored ? "cloudinary" : "provider",
        storageUrl: storageResult.url,
        storageStatus: storageResult.stored ? "stored" : "fallback",
        storageReason: storageResult.reason,
        storagePublicId: storageResult.publicId
      });

      await captureReservedCredits({
        userId: completedJob.userId,
        amount: completedJob.creditsUsed,
        generationId: completedJob.id,
        reason: "Audio generation completed"
      });

      return {
        status: "completed",
        job: completedJob
      };
    }

    if (status.status === "failed") {
      const failedJob = await failAudioJob(
        job.id,
        status.error || "Audio provider generation failed"
      );

      await sendGenerationFailedEmailNotification(job.userId);

      return {
        status: "failed",
        job: failedJob
      };
    }

    return {
      status: "processing",
      job
    };
  }

  return {
    status: "processing",
    job
  };
}
