import { mockImageProvider } from "./mock-image-provider";
import { mockVideoProvider } from "./mock-video-provider";
import { klingVideoProvider } from "./kling-video-provider";
import { replicateAudioProvider } from "./replicate-audio-provider";
import { replicateImageProvider } from "./replicate-image-provider";
import { replicateVideoProvider } from "./replicate-video-provider";
import { getVideoProviderPriority } from "./failover";

export function getImageProvider() {
  if (process.env.AI_IMAGE_PROVIDER === "replicate") {
    return replicateImageProvider;
  }

  return mockImageProvider;
}

export function getVideoProvider() {
  const configuredProvider =
    process.env.AI_VIDEO_PROVIDER || getVideoProviderPriority()[0];

  if (
    configuredProvider === "kling" ||
    configuredProvider === klingVideoProvider.name
  ) {
    return klingVideoProvider;
  }

  if (
    configuredProvider === "replicate" ||
    configuredProvider === replicateVideoProvider.name
  ) {
    return replicateVideoProvider;
  }

  return mockVideoProvider;
}

export function getAudioProvider() {
  return replicateAudioProvider;
}

export function getImageProviderByName(name?: string | null) {
  if (name === replicateImageProvider.name) return replicateImageProvider;
  if (name === mockImageProvider.name) return mockImageProvider;

  return getImageProvider();
}

export function getVideoProviderByName(name?: string | null) {
  if (name === klingVideoProvider.name) return klingVideoProvider;
  if (name === replicateVideoProvider.name) return replicateVideoProvider;
  if (name === mockVideoProvider.name) return mockVideoProvider;

  return getVideoProvider();
}

export function getAudioProviderByName(name?: string | null) {
  if (name === replicateAudioProvider.name) return replicateAudioProvider;

  return getAudioProvider();
}
