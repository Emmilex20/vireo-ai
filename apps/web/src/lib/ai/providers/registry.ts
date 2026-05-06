import { mockImageProvider } from "./mock-image-provider";
import { mockVideoProvider } from "./mock-video-provider";
import { replicateAudioProvider } from "./replicate-audio-provider";
import { replicateImageProvider } from "./replicate-image-provider";
import { replicateVideoProvider } from "./replicate-video-provider";

export function getImageProvider() {
  if (process.env.AI_IMAGE_PROVIDER === "replicate") {
    return replicateImageProvider;
  }

  return mockImageProvider;
}

export function getVideoProvider() {
  if (process.env.AI_VIDEO_PROVIDER === "replicate") {
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
  if (name === replicateVideoProvider.name) return replicateVideoProvider;
  if (name === mockVideoProvider.name) return mockVideoProvider;

  return getVideoProvider();
}

export function getAudioProviderByName(name?: string | null) {
  if (name === replicateAudioProvider.name) return replicateAudioProvider;

  return getAudioProvider();
}
