import type { VideoGenerationInput } from "./types";

export type ReplicateVideoModelId =
  | "runwayml/gen-4.5"
  | "prunaai/p-video"
  | "bytedance/seedance-2.0"
  | "kwaivgi/kling-v3-omni-video"
  | "kwaivgi/kling-v3-video"
  | "minimax/hailuo-02"
  | "google/veo-3.1"
  | "bytedance/seedance-1.5-pro"
  | "x-ai/grok-imagine"
  | "kwaivgi/kling-v2.6"
  | "wan-video/wan-2.6-i2v"
  | "openai/sora-2"
  | "lightricks/ltx-2.3-fast"
  | "kwaivgi/kling-v2.5"
  | "kwaivgi/kling-o1"
  | "google/veo-3"
  | "wan-video/wan-2.5-i2v"
  | "minimax/hailuo-2.3"
  | "kwaivgi/kling-v2.1"
  | "bytedance/seedance-1"
  | "vidu/vidu-q3"
  | "pixverse/pixverse-v5"
  | "wan-video/wan-2.2-i2v-fast"
  | "vidu/vidu-q2";

type VideoModelFeature =
  | "Reference"
  | "Start/End"
  | "Start Frame"
  | "Multi-shots"
  | "Audio"
  | "4K"
  | "480-720p"
  | "480-1080p"
  | "512-1080p"
  | "540-1080p"
  | "720-1080p"
  | "720p-4K"
  | "768-1080p"
  | "360-1080p"
  | "1-15s"
  | "1-16s"
  | "2-15s"
  | "3-10s"
  | "3-15s"
  | "4-15s"
  | "4-8s"
  | "4-12s"
  | "5-8s"
  | "5-10s"
  | "5-15s"
  | "6-10s"
  | "6-20s";

export type ReplicateVideoModelConfig = {
  id: ReplicateVideoModelId;
  label: string;
  description: string;
  defaultAspectRatio: string;
  defaultDuration: number;
  defaultResolution?: string;
  badge: string;
  slug: string;
  provider: string;
  recommended?: boolean;
  fast?: boolean;
  features: VideoModelFeature[];
  heroTone?: string;
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

const DEFAULT_VIDEO_MODEL: ReplicateVideoModelId = "kwaivgi/kling-v3-video";
const STANDARD_VIDEO_ASPECT_RATIOS = ["16:9", "9:16", "1:1"] as const;
const WIDE_VIDEO_ASPECT_RATIOS = [
  "16:9",
  "4:3",
  "1:1",
  "3:4",
  "9:16",
  "21:9",
] as const;
const DURATION_OPTIONS = [5, 10, 15, 20] as const;

export type VideoModelUiOptions = {
  aspectRatios: string[];
  durations: number[];
  resolutions: string[];
  required: string[];
  optional: string[];
};

function buildPrompt(input: VideoGenerationInput) {
  return [
    input.prompt.trim(),
    input.shotType,
    input.cameraMove ? `camera movement: ${input.cameraMove}` : null,
    input.motionIntensity ? `motion intensity: ${input.motionIntensity}` : null,
    input.styleStrength ? `style strength: ${input.styleStrength}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildStandardVideoInput(input: VideoGenerationInput) {
  const prompt = buildPrompt(input);
  const references = input.referenceImageUrls?.length
    ? input.referenceImageUrls
    : undefined;

  return {
    prompt,
    text: prompt,
    negative_prompt: input.negativePrompt || undefined,
    image: input.imageUrl || undefined,
    input_image: input.imageUrl || undefined,
    start_image: input.imageUrl || undefined,
    first_frame_image: input.imageUrl || undefined,
    source_image: input.imageUrl || undefined,
    end_image: input.endImageUrl || undefined,
    last_frame_image: input.endImageUrl || undefined,
    reference_images: references,
    references,
    image_input: references,
    input_images: references,
    images: references,
    audio: input.audioUrl || undefined,
    audio_url: input.audioUrl || undefined,
    input_audio: input.audioUrl || undefined,
    audio_reference: input.audioUrl || undefined,
    audio_inputs: input.audioUrl ? [input.audioUrl] : undefined,
    duration: input.duration ?? 5,
    seconds: input.duration ?? 5,
    aspect_ratio: input.aspectRatio ?? "16:9",
    resolution: input.resolution ?? "720p",
    fps: input.fps ?? 24,
    frame_rate: input.fps ?? 24,
    generate_audio: input.saveAudio ?? true,
    save_audio: input.saveAudio ?? true,
    prompt_upsampling: input.promptUpsampling ?? undefined,
    disable_safety_filter: input.disableSafetyFilter ?? undefined,
    draft: input.draft ?? undefined,
    seed: input.seed ?? undefined,
  };
}

function buildKlingInput(input: VideoGenerationInput) {
  return {
    ...buildStandardVideoInput(input),
    mode: "pro",
    prompt: buildPrompt(input),
    generate_audio: input.saveAudio ?? true,
    keep_original_sound: Boolean(input.imageUrl),
    video_reference_type: input.imageUrl ? "feature" : undefined,
  };
}

function buildSeedanceInput(input: VideoGenerationInput) {
  return {
    ...buildStandardVideoInput(input),
    prompt: buildPrompt(input),
    resolution: input.resolution ?? "1080p",
    camera_fixed: false,
  };
}

function buildVeoInput(input: VideoGenerationInput) {
  return {
    ...buildStandardVideoInput(input),
    prompt: buildPrompt(input),
    generate_audio: input.saveAudio ?? true,
  };
}

function buildWanInput(input: VideoGenerationInput) {
  return {
    ...buildStandardVideoInput(input),
    prompt: buildPrompt(input),
    resolution: input.resolution ?? "720p",
  };
}

const sharedImageAudioSupport = {
  imageInput: true,
  audioGeneration: true,
  resolutionControl: true,
  draftMode: false,
  promptUpsampling: false,
  disableSafetyFilter: false,
  styleStrength: false,
  motionGuidance: false,
  shotType: true,
  fpsControl: false,
} satisfies ReplicateVideoModelConfig["supports"];

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
    defaultResolution: "1080p",
    badge: "Balanced",
    slug: "runway-gen-4-5",
    provider: "Runway",
    features: ["Reference", "Start Frame", "720-1080p", "5-10s"],
    heroTone: "from-slate-800 via-cyan-950 to-black",
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
        prompt: buildPrompt(input),
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
    slug: "p-video",
    provider: "Pruna AI",
    fast: true,
    features: ["Reference", "Audio", "720-1080p", "5-10s"],
    heroTone: "from-zinc-800 via-emerald-950 to-black",
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
  "bytedance/seedance-2.0": {
    id: "bytedance/seedance-2.0",
    label: "Seedance 2.0",
    description: "Cinematic videos with audio and multi-shot scene structure.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "1080p",
    badge: "New",
    slug: "seedance-2",
    provider: "ByteDance",
    recommended: true,
    features: ["Reference", "Start/End", "Audio", "480-1080p", "4-15s"],
    heroTone: "from-slate-900 via-sky-950 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildSeedanceInput,
  },
  "kwaivgi/kling-v3-omni-video": {
    id: "kwaivgi/kling-v3-omni-video",
    label: "Kling 3.0 Omni",
    description:
      "Enhanced multimodal references for premium audio and motion.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "4K",
    badge: "New",
    slug: "kling-v3-omni",
    provider: "Kling",
    recommended: true,
    features: ["Reference", "Multi-shots", "Audio", "720p-4K", "3-15s"],
    heroTone: "from-emerald-950 via-black to-fuchsia-950",
    supports: sharedImageAudioSupport,
    buildInput: buildKlingInput,
  },
  "kwaivgi/kling-v3-video": {
    id: "kwaivgi/kling-v3-video",
    label: "Kling 3.0",
    description: "Enhanced audio, consistency, and multi-shot workflows.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "1080p",
    badge: "New",
    slug: "kling-v3",
    provider: "Kling",
    recommended: true,
    features: ["Start/End", "Multi-shots", "Audio", "720p-4K", "3-15s"],
    heroTone: "from-amber-100 via-slate-800 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildKlingInput,
  },
  "minimax/hailuo-02": {
    id: "minimax/hailuo-02",
    label: "Hailuo 02",
    description: "Great for motion and physical actions.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Motion",
    slug: "hailuo-02",
    provider: "MiniMax",
    features: ["Start/End", "512-1080p", "6-10s"],
    heroTone: "from-pink-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput(input) {
      return {
        prompt: buildPrompt(input),
        prompt_optimizer: true,
        first_frame_image: input.imageUrl || undefined,
        duration: input.duration ?? 10,
      };
    },
  },
  "google/veo-3.1": {
    id: "google/veo-3.1",
    label: "Veo 3.1",
    description: "High fidelity videos with audio and 4K output.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "4K",
    badge: "New",
    slug: "veo-3-1",
    provider: "Google",
    features: ["Reference", "Start/End", "Audio", "4K", "4-8s"],
    heroTone: "from-blue-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildVeoInput,
  },
  "bytedance/seedance-1.5-pro": {
    id: "bytedance/seedance-1.5-pro",
    label: "Seedance 1.5 Pro",
    description: "Cinematic videos with audio and multi-shot scenes.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Pro",
    slug: "seedance-1-5-pro",
    provider: "ByteDance",
    features: ["Start/End", "Multi-shots", "Audio", "480-1080p", "4-12s"],
    heroTone: "from-sky-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildSeedanceInput,
  },
  "x-ai/grok-imagine": {
    id: "x-ai/grok-imagine",
    label: "Grok Imagine",
    description: "Fast generation of cinematic videos.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "720p",
    badge: "Fast",
    slug: "grok-imagine",
    provider: "xAI",
    fast: true,
    features: ["Start Frame", "Audio", "480-720p", "1-15s"],
    heroTone: "from-zinc-800 via-zinc-950 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildStandardVideoInput,
  },
  "kwaivgi/kling-v2.6": {
    id: "kwaivgi/kling-v2.6",
    label: "Kling 2.6",
    description: "Cinematic videos with audio and voice.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Stable",
    slug: "kling-v2-6",
    provider: "Kling",
    features: ["Start/End", "Audio", "720-1080p", "5-10s"],
    heroTone: "from-cyan-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildKlingInput,
  },
  "wan-video/wan-2.6-i2v": {
    id: "wan-video/wan-2.6-i2v",
    label: "Wan 2.6",
    description: "Cinematic videos with audio and multi-shot prompts.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "New",
    slug: "wan-2-6",
    provider: "Wan",
    features: ["Start Frame", "Multi-shots", "Audio", "720-1080p", "5-15s"],
    heroTone: "from-violet-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildWanInput,
  },
  "openai/sora-2": {
    id: "openai/sora-2",
    label: "Sora 2",
    description: "Storytelling videos with audio.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Story",
    slug: "sora-2",
    provider: "OpenAI",
    features: ["Start Frame", "Audio", "720-1080p", "4-12s"],
    heroTone: "from-sky-900 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildStandardVideoInput,
  },
  "lightricks/ltx-2.3-fast": {
    id: "lightricks/ltx-2.3-fast",
    label: "LTX 2.3",
    description: "Next-gen cinematic 4K videos up to 20s.",
    defaultAspectRatio: "16:9",
    defaultDuration: 20,
    defaultResolution: "4K",
    badge: "Fast",
    slug: "ltx-2-3",
    provider: "Lightricks",
    fast: true,
    features: ["Start/End", "Audio", "4K", "6-20s"],
    heroTone: "from-neutral-900 via-stone-950 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildStandardVideoInput,
  },
  "kwaivgi/kling-v2.5": {
    id: "kwaivgi/kling-v2.5",
    label: "Kling 2.5",
    description: "Great creativity with exceptional value.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Value",
    slug: "kling-v2-5",
    provider: "Kling",
    features: ["Start/End", "720-1080p", "5-10s"],
    heroTone: "from-teal-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput: buildKlingInput,
  },
  "kwaivgi/kling-o1": {
    id: "kwaivgi/kling-o1",
    label: "Kling O1",
    description: "Great for multi-reference and video editing.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Edit",
    slug: "kling-o1",
    provider: "Kling",
    features: ["Reference", "Start/End", "720-1080p", "3-10s"],
    heroTone: "from-cyan-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildKlingInput,
  },
  "google/veo-3": {
    id: "google/veo-3",
    label: "Veo 3",
    description: "High fidelity videos with audio.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "1080p",
    badge: "Quality",
    slug: "veo-3",
    provider: "Google",
    features: ["Start Frame", "Audio", "720-1080p", "4-8s"],
    heroTone: "from-blue-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildVeoInput,
  },
  "wan-video/wan-2.5-i2v": {
    id: "wan-video/wan-2.5-i2v",
    label: "Wan 2.5",
    description: "Professional creative videos.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Pro",
    slug: "wan-2-5",
    provider: "Wan",
    features: ["Start Frame", "480-1080p", "5-10s"],
    heroTone: "from-violet-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput: buildWanInput,
  },
  "minimax/hailuo-2.3": {
    id: "minimax/hailuo-2.3",
    label: "Hailuo 2.3",
    description: "Great for cinematic and acting scenes.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Cinematic",
    slug: "hailuo-2-3",
    provider: "MiniMax",
    features: ["Start Frame", "768-1080p", "6-10s"],
    heroTone: "from-pink-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput: buildStandardVideoInput,
  },
  "kwaivgi/kling-v2.1": {
    id: "kwaivgi/kling-v2.1",
    label: "Kling 2.1",
    description: "Natural motion and great prompt adherence.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Classic",
    slug: "kling-v2-1",
    provider: "Kling",
    features: ["Start/End", "720-1080p", "5-10s"],
    heroTone: "from-cyan-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput: buildKlingInput,
  },
  "bytedance/seedance-1": {
    id: "bytedance/seedance-1",
    label: "Seedance 1",
    description: "Narrative videos with multi-shot structure.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Narrative",
    slug: "seedance-1",
    provider: "ByteDance",
    features: ["Start/End", "Multi-shots", "480-1080p", "5-10s"],
    heroTone: "from-sky-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput: buildSeedanceInput,
  },
  "vidu/vidu-q3": {
    id: "vidu/vidu-q3",
    label: "Vidu Q3",
    description: "Great for storyboards and adding references.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "1080p",
    badge: "Storyboard",
    slug: "vidu-q3",
    provider: "Vidu",
    features: ["Start Frame", "Audio", "540-1080p", "1-16s"],
    heroTone: "from-cyan-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildStandardVideoInput,
  },
  "pixverse/pixverse-v5": {
    id: "pixverse/pixverse-v5",
    label: "PixVerse 5",
    description: "Great for short videos.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "1080p",
    badge: "Fast",
    slug: "pixverse-5",
    provider: "PixVerse",
    fast: true,
    features: ["Start/End", "Multi-shots", "Audio", "360-1080p", "5-10s"],
    heroTone: "from-fuchsia-950 via-zinc-900 to-black",
    supports: sharedImageAudioSupport,
    buildInput: buildStandardVideoInput,
  },
  "wan-video/wan-2.2-i2v-fast": {
    id: "wan-video/wan-2.2-i2v-fast",
    label: "Wan 2.2",
    description: "Consistent aesthetic for video concepts.",
    defaultAspectRatio: "16:9",
    defaultDuration: 10,
    defaultResolution: "720p",
    badge: "Aesthetic",
    slug: "wan-2-2",
    provider: "Wan",
    features: ["Start Frame", "480-720p", "5-10s"],
    heroTone: "from-violet-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput: buildWanInput,
  },
  "vidu/vidu-q2": {
    id: "vidu/vidu-q2",
    label: "Vidu Q2",
    description: "Great for anime scenes and storyboards.",
    defaultAspectRatio: "16:9",
    defaultDuration: 5,
    defaultResolution: "1080p",
    badge: "Anime",
    slug: "vidu-q2",
    provider: "Vidu",
    features: ["Reference", "Start/End", "720-1080p", "5-8s"],
    heroTone: "from-cyan-950 via-zinc-900 to-black",
    supports: { ...sharedImageAudioSupport, audioGeneration: false },
    buildInput: buildStandardVideoInput,
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

export function resolveReplicateVideoModelBySlug(slug?: string | null) {
  if (!slug) return null;

  return (
    listReplicateVideoModels().find((model) => model.slug === slug) ?? null
  );
}

export function listReplicateVideoModels() {
  return Object.values(REPLICATE_VIDEO_MODELS);
}

function getDurationRange(model: ReplicateVideoModelConfig) {
  const durationFeature = model.features.find((feature) => /\d+-\d+s/.test(feature));
  const range = durationFeature?.match(/(\d+)-(\d+)s/);

  if (!range) {
    return [model.defaultDuration, model.defaultDuration] as const;
  }

  return [Number(range[1]), Number(range[2])] as const;
}

function getResolutionOptions(model: ReplicateVideoModelConfig) {
  if (!model.supports.resolutionControl) {
    return model.defaultResolution ? [model.defaultResolution] : [];
  }

  if (model.features.includes("4K") || model.features.includes("720p-4K")) {
    return ["720p", "1080p", "4K"];
  }

  if (
    model.features.includes("480-1080p") ||
    model.features.includes("512-1080p") ||
    model.features.includes("540-1080p") ||
    model.features.includes("768-1080p") ||
    model.features.includes("360-1080p")
  ) {
    return ["480p", "720p", "1080p"];
  }

  if (model.features.includes("480-720p")) {
    return ["480p", "720p"];
  }

  return ["720p", "1080p"];
}

export function getVideoModelUiOptions(
  model: ReplicateVideoModelConfig
): VideoModelUiOptions {
  const [minDuration, maxDuration] = getDurationRange(model);
  const durations = DURATION_OPTIONS.filter(
    (duration) => duration >= minDuration && duration <= maxDuration
  );
  const aspectRatios = model.provider === "ByteDance"
    ? [...WIDE_VIDEO_ASPECT_RATIOS]
    : [...STANDARD_VIDEO_ASPECT_RATIOS];
  const optional = [
    model.supports.imageInput ? "Start/source image" : null,
    model.features.includes("Start/End") ? "End frame" : null,
    model.features.includes("Reference") || model.features.includes("Multi-shots")
      ? "Visual references"
      : null,
    model.supports.audioGeneration ? "Audio reference or generated audio" : null,
    model.supports.resolutionControl ? "Resolution" : null,
    model.supports.fpsControl ? "FPS" : null,
    model.supports.draftMode ? "Draft mode" : null,
    model.supports.promptUpsampling ? "Prompt upsampling" : null,
    model.supports.disableSafetyFilter ? "Safety filter toggle" : null,
  ].filter(Boolean) as string[];

  return {
    aspectRatios,
    durations: durations.length ? durations : [model.defaultDuration],
    resolutions: getResolutionOptions(model),
    required: ["Prompt"],
    optional,
  };
}
