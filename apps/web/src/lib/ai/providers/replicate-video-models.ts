import type { VideoGenerationInput } from "./types";

export type ReplicateVideoModelId =
  | "runwayml/gen-4.5"
  | "prunaai/p-video"
  | "kwaivgi/kling-v3-omni-video";

export type ReplicateVideoModelConfig = {
  id: ReplicateVideoModelId;
  label: string;
  description: string;
  defaultAspectRatio: string;
  defaultDuration: number;
  defaultResolution?: string;
  badge: string;
  supports: {
    imageInput: boolean;
    audioGeneration: boolean;
    resolutionControl: boolean;
    draftMode: boolean;
    promptUpsampling: boolean;
    disableSafetyFilter: boolean;
    styleStrength: boolean;
    motionGuidance: boolean;
    shotType: boolean;
    fpsControl: boolean;
  };
  buildInput: (input: VideoGenerationInput) => Record<string, unknown>;
};

const DEFAULT_VIDEO_MODEL: ReplicateVideoModelId = "runwayml/gen-4.5";

export const REPLICATE_VIDEO_MODELS: Record<
  ReplicateVideoModelId,
  ReplicateVideoModelConfig
> = {
  "runwayml/gen-4.5": {
    id: "runwayml/gen-4.5",
    label: "Runway Gen-4.5",
    description:
      "High-fidelity prompt-to-video with optional first-frame image guidance.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    badge: "Balanced",
    supports: {
      imageInput: true,
      audioGeneration: false,
      resolutionControl: false,
      draftMode: false,
      promptUpsampling: false,
      disableSafetyFilter: false,
      styleStrength: false,
      motionGuidance: false,
      shotType: false,
      fpsControl: false,
    },
    buildInput(input) {
      return {
        prompt: input.prompt.trim(),
        image: input.imageUrl || undefined,
        aspect_ratio: input.aspectRatio ?? "16:9",
        duration: input.duration ?? 5,
      };
    },
  },
  "prunaai/p-video": {
    id: "prunaai/p-video",
    label: "P Video",
    description:
      "Fast draft-friendly text-to-video and image-to-video with explicit control over resolution and safety options.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "720p",
    badge: "Fastest",
    supports: {
      imageInput: true,
      audioGeneration: true,
      resolutionControl: true,
      draftMode: true,
      promptUpsampling: true,
      disableSafetyFilter: true,
      styleStrength: false,
      motionGuidance: false,
      shotType: false,
      fpsControl: true,
    },
    buildInput(input) {
      return {
        prompt: input.prompt.trim(),
        image: input.imageUrl || undefined,
        duration: input.duration ?? 5,
        aspect_ratio: input.aspectRatio ?? "16:9",
        resolution: input.resolution ?? "720p",
        fps: input.fps ?? 24,
        draft: input.draft ?? false,
        save_audio: input.saveAudio ?? true,
        prompt_upsampling: input.promptUpsampling ?? false,
        disable_safety_filter: input.disableSafetyFilter ?? true,
        no_op: input.noOp ?? false,
        seed: input.seed ?? undefined,
        negative_prompt: input.negativePrompt || undefined,
      };
    },
  },
  "kwaivgi/kling-v3-omni-video": {
    id: "kwaivgi/kling-v3-omni-video",
    label: "Kling v3 Omni Video",
    description:
      "Premium long-form cinematic model with audio generation and richer prompt adherence.",
    defaultAspectRatio: "16:9",
    defaultDuration: 15,
    badge: "Premium",
    supports: {
      imageInput: true,
      audioGeneration: true,
      resolutionControl: false,
      draftMode: false,
      promptUpsampling: false,
      disableSafetyFilter: false,
      styleStrength: false,
      motionGuidance: false,
      shotType: false,
      fpsControl: false,
    },
    buildInput(input) {
      return {
        mode: "pro",
        prompt: input.prompt.trim(),
        start_image: input.imageUrl || undefined,
        duration: input.duration ?? 10,
        aspect_ratio: input.aspectRatio ?? "16:9",
        generate_audio: true,
        keep_original_sound: Boolean(input.imageUrl),
        video_reference_type: "feature",
      };
    },
  },
};

export function isReplicateVideoModelId(
  value: string
): value is ReplicateVideoModelId {
  return value in REPLICATE_VIDEO_MODELS;
}

export function resolveReplicateVideoModel(modelId?: string | null) {
  if (modelId && isReplicateVideoModelId(modelId)) {
    return REPLICATE_VIDEO_MODELS[modelId];
  }

  const envModel = process.env.REPLICATE_VIDEO_MODEL;

  if (envModel && isReplicateVideoModelId(envModel)) {
    return REPLICATE_VIDEO_MODELS[envModel];
  }

  return REPLICATE_VIDEO_MODELS[DEFAULT_VIDEO_MODEL];
}

export function listReplicateVideoModels() {
  return Object.values(REPLICATE_VIDEO_MODELS);
}
