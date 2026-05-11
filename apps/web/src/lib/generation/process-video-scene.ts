import {
  getVideoSceneForUser,
  refundSceneGeneration,
  updateVideoSceneMedia
} from "@vireon/db";
import {
  getImageProvider,
  getVideoProvider,
  getVideoProviderByName
} from "@/lib/ai/providers/registry";
import {
  getFallbackProviderName,
  shouldFallbackProviderFailure
} from "@/lib/ai/providers/failover";
import type { ProviderJobResult } from "@/lib/ai/providers/types";
import { SCENE_GENERATION_COSTS } from "@/lib/billing/scene-costs";
import { uploadRemoteAssetToCloudinary } from "@/lib/storage/cloudinary";

const SCENE_GENERATION_TIMEOUT_MS = 5 * 60 * 1000;
const SCENE_IMAGE_POLL_INTERVAL_MS = 3000;
const SCENE_VIDEO_POLL_INTERVAL_MS = 5000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refundAndFailScene(params: {
  userId: string;
  sceneId: string;
  kind: "image" | "video";
  status: "image_failed" | "video_failed";
  amount: number;
  failureReason: string;
}) {
  await refundSceneGeneration({
    userId: params.userId,
    sceneId: params.sceneId,
    kind: params.kind,
    amount: params.amount
  });

  return updateVideoSceneMedia({
    userId: params.userId,
    sceneId: params.sceneId,
    status: params.status,
    failureReason: params.failureReason
  });
}

export async function processVideoScene(params: {
  userId: string;
  sceneId: string;
  kind: "image" | "video";
}) {
  const scene = await getVideoSceneForUser({
    userId: params.userId,
    sceneId: params.sceneId
  });

  if (!scene) {
    throw new Error("Scene not found");
  }

  if (params.kind === "image") {
    await updateVideoSceneMedia({
      userId: params.userId,
      sceneId: params.sceneId,
      status: "generating_image"
    });

    const provider = getImageProvider();

    const providerJob = await provider.createImageJob({
      prompt: scene.prompt,
      aspectRatio: "16:9",
      qualityMode: "high",
      promptBoost: true
    });

    const deadline = Date.now() + SCENE_GENERATION_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const status = await provider.getImageJobStatus(providerJob.providerJobId);

      if (status.status === "completed" && status.outputUrl) {
        const stored = await uploadRemoteAssetToCloudinary({
          url: status.outputUrl,
          folder: "vireon/scenes/images",
          resourceType: "image"
        });

        return updateVideoSceneMedia({
          userId: params.userId,
          sceneId: params.sceneId,
          imageUrl: stored.url,
          status: "image_completed",
          failureReason: null
        });
      }

      if (status.status === "failed") {
        return refundAndFailScene({
          userId: params.userId,
          sceneId: params.sceneId,
          kind: "image",
          status: "image_failed",
          amount: SCENE_GENERATION_COSTS.image,
          failureReason: status.error || "Scene image generation failed"
        });
      }

      const remainingMs = deadline - Date.now();

      if (remainingMs > 0) {
        await sleep(Math.min(SCENE_IMAGE_POLL_INTERVAL_MS, remainingMs));
      }
    }

    return refundAndFailScene({
      userId: params.userId,
      sceneId: params.sceneId,
      kind: "image",
      status: "image_failed",
      amount: SCENE_GENERATION_COSTS.image,
      failureReason: "Scene image generation timed out"
    });
  }

  if (params.kind === "video") {
    if (!scene.imageUrl) {
      throw new Error("Generate a scene image first.");
    }

    await updateVideoSceneMedia({
      userId: params.userId,
      sceneId: params.sceneId,
      status: "generating_video"
    });

    let provider = getVideoProvider();
    const providerInput = {
      prompt: scene.prompt,
      imageUrl: scene.imageUrl,
      duration: 5,
      aspectRatio: "16:9",
      motionIntensity: "medium",
      cameraMove: "Slow Push In",
      styleStrength: "medium",
      shotType: "Wide Shot",
      fps: 24
    };
    let providerJob: ProviderJobResult;

    try {
      providerJob = await provider.createVideoJob(providerInput);
    } catch (error) {
      if (!shouldFallbackProviderFailure({ error })) {
        throw error;
      }

      const fallbackName = getFallbackProviderName({
        type: "video",
        currentProviderName: provider.name
      });

      if (!fallbackName || fallbackName === provider.name) {
        throw error;
      }

      provider = getVideoProviderByName(fallbackName);
      providerJob = await provider.createVideoJob(providerInput);
    }

    let usedFallback = provider.name !== getVideoProvider().name;

    const deadline = Date.now() + SCENE_GENERATION_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const status = await provider.getVideoJobStatus(providerJob.providerJobId);

      if (status.status === "completed" && status.outputUrl) {
        const stored = await uploadRemoteAssetToCloudinary({
          url: status.outputUrl,
          folder: "vireon/scenes/videos",
          resourceType: "video"
        });

        return updateVideoSceneMedia({
          userId: params.userId,
          sceneId: params.sceneId,
          videoUrl: stored.url,
          status: "video_completed",
          failureReason: null
        });
      }

      if (status.status === "failed") {
        const fallbackName = getFallbackProviderName({
          type: "video",
          currentProviderName: provider.name
        });

        if (
          !usedFallback &&
          shouldFallbackProviderFailure({ reason: status.error }) &&
          fallbackName &&
          fallbackName !== provider.name
        ) {
          provider = getVideoProviderByName(fallbackName);
          providerJob = await provider.createVideoJob(providerInput);
          usedFallback = true;
          continue;
        }

        return refundAndFailScene({
          userId: params.userId,
          sceneId: params.sceneId,
          kind: "video",
          status: "video_failed",
          amount: SCENE_GENERATION_COSTS.video,
          failureReason: status.error || "Scene video generation failed"
        });
      }

      const remainingMs = deadline - Date.now();

      if (remainingMs > 0) {
        await sleep(Math.min(SCENE_VIDEO_POLL_INTERVAL_MS, remainingMs));
      }
    }

    return refundAndFailScene({
      userId: params.userId,
      sceneId: params.sceneId,
      kind: "video",
      status: "video_failed",
      amount: SCENE_GENERATION_COSTS.video,
      failureReason: "Scene video generation timed out"
    });
  }

  throw new Error("Invalid scene generation kind");
}
