import {
  completeImageJob,
  completeVideoJob,
  failImageJob,
  failVideoJob,
  markGenerationFailover
} from "@vireon/db";
import { getFallbackProviderName } from "@/lib/ai/providers/failover";
import {
  getImageProviderByName,
  getVideoProviderByName
} from "@/lib/ai/providers/registry";
import { sendGenerationFailedEmailNotification } from "@/lib/email/notifications";
import { uploadRemoteAssetToCloudinary } from "@/lib/storage/cloudinary";

export type ProcessableGenerationJob = {
  id: string;
  userId: string;
  type: string;
  status: string;
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
};

type ProcessedGenerationJob =
  | ProcessableGenerationJob
  | Awaited<ReturnType<typeof completeImageJob>>
  | Awaited<ReturnType<typeof completeVideoJob>>
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
        const fallbackJob = await fallbackProvider.createImageJob({
          prompt: job.prompt ?? "",
          negativePrompt: job.negativePrompt ?? undefined,
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

      return {
        status: "completed",
        job: completedJob
      };
    }

    if (status.status === "failed") {
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

  return {
    status: "processing",
    job
  };
}
