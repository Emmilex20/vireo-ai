import type { ImageGenerationInput } from "./types";

const IMAGE_MODEL_IDS = [
  "openai/gpt-image-2",
  "google/nano-banana-2",
  "google/nano-banana-pro",
  "recraft-ai/recraft-v4",
  "wan-video/wan-2.7-image",
  "x-ai/grok-imagine-image",
  "bytedance/seedream-5-lite",
  "bytedance/seedream-4.5",
  "google/nano-banana",
  "bytedance/seedream-4",
  "qwen/qwen-image-2",
  "black-forest-labs/flux-kontext-pro",
  "openai/gpt-image-1.5",
  "black-forest-labs/flux-2-pro",
  "google/imagen-4",
  "openart/openart-photorealistic",
  "z-ai/z-image",
  "qwen/qwen-image-max",
  "qwen/qwen-image-plus",
  "black-forest-labs/flux-2-klein-9b",
  "black-forest-labs/flux-2-max",
  "black-forest-labs/flux-2-flex",
  "black-forest-labs/flux-dev",
  "black-forest-labs/flux-1.1-pro",
  "black-forest-labs/flux-kontext-max",
  "rundiffusion/juggernaut-flux-pro",
  "openart/openart-sdxl",
  "rundiffusion/juggernaut-xl",
  "dynavision/dynavision-xl",
  "black-forest-labs/flux-2-lora-gallery-realism",
] as const;

export type ReplicateImageModelId = (typeof IMAGE_MODEL_IDS)[number];

type ImageModelFeature =
  | "Reference"
  | "Variations"
  | "2K"
  | "3K"
  | "4K"
  | "SVG"
  | "Open-source";

export type ReplicateImageModelConfig = {
  id: ReplicateImageModelId;
  label: string;
  description: string;
  defaultAspectRatio: string;
  badge?: string;
  slug: string;
  provider: string;
  recommended?: boolean;
  fast?: boolean;
  features: ImageModelFeature[];
  heroTone?: string;
  supports: {
    negativePrompt: boolean;
    referenceImage: boolean;
    seed: boolean;
    steps: boolean;
    guidance: boolean;
  };
  buildInput: (input: ImageGenerationInput) => Record<string, unknown>;
};

const DEFAULT_IMAGE_MODEL: ReplicateImageModelId = "openai/gpt-image-2";
const UNAVAILABLE_IMAGE_MODEL_IDS = new Set(["kwaivgi/kling-o1-image"]);
const STANDARD_IMAGE_ASPECT_RATIOS = [
  "1:1",
  "3:2",
  "2:3",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
] as const;
const GPT_IMAGE_ASPECT_RATIOS = ["1:1", "3:2", "2:3"] as const;

export type ImageModelUiOptions = {
  aspectRatios: string[];
  qualityModes: Array<"standard" | "high" | "ultra">;
  required: string[];
  optional: string[];
};

function mapAspectRatio(aspectRatio?: string) {
  const supported = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"];

  if (aspectRatio && supported.includes(aspectRatio)) {
    return aspectRatio;
  }

  return "1:1";
}

function buildPrompt(input: {
  prompt: string;
  style?: string;
  qualityMode?: string;
  promptBoost?: boolean;
}) {
  const parts = [input.prompt.trim()];

  if (input.style) {
    parts.push(`${input.style} style`);
  }

  if (input.qualityMode === "high") {
    parts.push("high detail, premium cinematic quality");
  }

  if (input.qualityMode === "ultra") {
    parts.push("ultra-detailed, premium cinematic quality, photoreal finish");
  }

  if (input.promptBoost) {
    parts.push("professional lighting, clean composition, sharp focus");
  }

  return parts.join(", ");
}

function buildNegativePrompt(negativePrompt?: string) {
  const defaults = [
    "blurry",
    "low quality",
    "distorted",
    "bad anatomy",
    "watermark",
    "text artifacts",
  ];

  if (!negativePrompt?.trim()) {
    return defaults.join(", ");
  }

  return `${negativePrompt.trim()}, ${defaults.join(", ")}`;
}

function buildImagePrompt(input: ImageGenerationInput) {
  const prompt = buildPrompt(input);

  if (!input.negativePrompt?.trim()) {
    return prompt;
  }

  return `${prompt}. Avoid: ${input.negativePrompt.trim()}.`;
}

function buildStandardImageInput(input: ImageGenerationInput) {
  const prompt = buildPrompt(input);
  const negativePrompt = buildNegativePrompt(input.negativePrompt);

  return {
    prompt,
    text: prompt,
    negative_prompt: negativePrompt,
    aspect_ratio: mapAspectRatio(input.aspectRatio),
    aspect: mapAspectRatio(input.aspectRatio),
    image_size: input.qualityMode === "ultra" ? "2K" : "1K",
    size: input.qualityMode === "ultra" ? "4K" : "2K",
    resolution: input.qualityMode === "ultra" ? "2K" : undefined,
    output_format: "webp",
    num_outputs: 1,
    num_images: 1,
    number_of_images: 1,
    max_images: 1,
    seed: input.seed ?? undefined,
    steps: input.steps ?? undefined,
    num_inference_steps: input.steps ?? undefined,
    guidance: input.guidance ?? undefined,
    guidance_scale: input.guidance ?? undefined,
  };
}

function buildReferenceImageInput(input: ImageGenerationInput) {
  const referenceImages = input.referenceImageUrl
    ? [input.referenceImageUrl]
    : undefined;

  return {
    ...buildStandardImageInput(input),
    image: input.referenceImageUrl || undefined,
    input_image: input.referenceImageUrl || undefined,
    reference_image: input.referenceImageUrl || undefined,
    reference: input.referenceImageUrl || undefined,
    image_input: referenceImages,
    input_images: referenceImages,
    reference_images: referenceImages,
    images: referenceImages,
  };
}

function buildGptImageInput(input: ImageGenerationInput) {
  const referenceImages = input.referenceImageUrl
    ? [input.referenceImageUrl]
    : undefined;
  const quality =
    input.qualityMode === "ultra"
      ? "high"
      : input.qualityMode === "standard"
        ? "medium"
        : "auto";

  return {
    prompt: buildImagePrompt(input),
    input_images: referenceImages,
    aspect_ratio: GPT_IMAGE_ASPECT_RATIOS.includes(
      input.aspectRatio as (typeof GPT_IMAGE_ASPECT_RATIOS)[number]
    )
      ? input.aspectRatio
      : "1:1",
    quality,
    number_of_images: 1,
    output_format: "webp",
    background: "auto",
    moderation: "auto",
  };
}

function buildGoogleImageInput(input: ImageGenerationInput) {
  const referenceImages = input.referenceImageUrl
    ? [input.referenceImageUrl]
    : undefined;

  return {
    prompt: buildImagePrompt(input),
    image_input: referenceImages ?? [],
    input_images: referenceImages,
    aspect_ratio: mapAspectRatio(input.aspectRatio),
    resolution: input.qualityMode === "ultra" ? "2K" : "1K",
    output_format: "jpg",
  };
}

function buildImagenInput(input: ImageGenerationInput) {
  return {
    prompt: buildImagePrompt(input),
    image_size: input.qualityMode === "ultra" ? "2K" : "1K",
    aspect_ratio: mapAspectRatio(input.aspectRatio),
    output_format: "jpg",
    safety_filter_level: "block_only_high",
  };
}

function buildSeedreamInput(input: ImageGenerationInput) {
  return {
    prompt: buildImagePrompt(input),
    size: input.qualityMode === "ultra" ? "4K" : "2K",
    max_images: 1,
    image_input: input.referenceImageUrl ? [input.referenceImageUrl] : [],
    aspect_ratio: mapAspectRatio(input.aspectRatio),
    sequential_image_generation: "disabled",
  };
}

const promptOnlySupport = {
  negativePrompt: true,
  referenceImage: false,
  seed: false,
  steps: false,
  guidance: false,
} satisfies ReplicateImageModelConfig["supports"];

const referenceSupport = {
  negativePrompt: true,
  referenceImage: true,
  seed: false,
  steps: false,
  guidance: false,
} satisfies ReplicateImageModelConfig["supports"];

export const REPLICATE_IMAGE_MODELS: Record<
  ReplicateImageModelId,
  ReplicateImageModelConfig
> = {
  "openai/gpt-image-2": {
    id: "openai/gpt-image-2",
    label: "GPT Image 2",
    description: "OpenAI's next-gen image model",
    defaultAspectRatio: "1:1",
    badge: "New",
    slug: "gpt-image-2",
    provider: "OpenAI",
    recommended: true,
    features: ["Reference"],
    heroTone: "from-sky-500 via-blue-950 to-black",
    supports: referenceSupport,
    buildInput: buildGptImageInput,
  },
  "google/nano-banana-2": {
    id: "google/nano-banana-2",
    label: "Nano Banana 2",
    description: "Google's Gemini 3.1 Flash image model",
    defaultAspectRatio: "1:1",
    badge: "New",
    slug: "nano-banana-2",
    provider: "Google",
    recommended: true,
    features: ["Reference", "4K"],
    heroTone: "from-yellow-400 via-rose-900 to-black",
    supports: referenceSupport,
    buildInput: buildGoogleImageInput,
  },
  "google/nano-banana-pro": {
    id: "google/nano-banana-pro",
    label: "Nano Banana Pro",
    description: "Google's premium image model",
    defaultAspectRatio: "16:9",
    slug: "nano-banana-pro",
    provider: "Google",
    recommended: true,
    features: ["Reference", "4K"],
    heroTone: "from-amber-500 via-stone-900 to-black",
    supports: referenceSupport,
    buildInput: buildGoogleImageInput,
  },
  "recraft-ai/recraft-v4": {
    id: "recraft-ai/recraft-v4",
    label: "Recraft V4",
    description: "Recraft's image and SVG generation model",
    defaultAspectRatio: "1:1",
    badge: "New",
    slug: "recraft-v4",
    provider: "Recraft",
    features: ["2K", "SVG"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "wan-video/wan-2.7-image": {
    id: "wan-video/wan-2.7-image",
    label: "Wan 2.7",
    description: "Alibaba's image model with facial control and text rendering",
    defaultAspectRatio: "16:9",
    badge: "New",
    slug: "wan-2-7",
    provider: "Wan",
    features: ["Reference", "4K"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "x-ai/grok-imagine-image": {
    id: "x-ai/grok-imagine-image",
    label: "Grok Imagine",
    description: "xAI's Aurora-powered image model",
    defaultAspectRatio: "16:9",
    badge: "Fast",
    slug: "grok-imagine",
    provider: "xAI",
    fast: true,
    features: ["Reference", "2K"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "bytedance/seedream-5-lite": {
    id: "bytedance/seedream-5-lite",
    label: "Seedream 5.0 Lite",
    description: "Bytedance's lightweight 5.0 image model",
    defaultAspectRatio: "16:9",
    slug: "seedream-5-lite",
    provider: "ByteDance",
    features: ["Reference", "3K"],
    supports: referenceSupport,
    buildInput: buildSeedreamInput,
  },
  "bytedance/seedream-4.5": {
    id: "bytedance/seedream-4.5",
    label: "Seedream 4.5",
    description: "Bytedance's advanced image model",
    defaultAspectRatio: "16:9",
    badge: "Fast",
    slug: "seedream-4-5",
    provider: "ByteDance",
    fast: true,
    features: ["Reference", "4K"],
    supports: referenceSupport,
    buildInput: buildSeedreamInput,
  },
  "google/nano-banana": {
    id: "google/nano-banana",
    label: "Nano Banana",
    description: "Google's standard image model",
    defaultAspectRatio: "1:1",
    slug: "nano-banana",
    provider: "Google",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildGoogleImageInput,
  },
  "bytedance/seedream-4": {
    id: "bytedance/seedream-4",
    label: "Seedream 4.0",
    description: "Bytedance's standard image model",
    defaultAspectRatio: "16:9",
    slug: "seedream-4",
    provider: "ByteDance",
    features: ["Reference", "4K"],
    supports: referenceSupport,
    buildInput: buildSeedreamInput,
  },
  "qwen/qwen-image-2": {
    id: "qwen/qwen-image-2",
    label: "Qwen Image 2",
    description: "Enhanced realism and improved text rendering",
    defaultAspectRatio: "1:1",
    badge: "Fast",
    slug: "qwen-image-2",
    provider: "Qwen",
    fast: true,
    features: ["Open-source"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "black-forest-labs/flux-kontext-pro": {
    id: "black-forest-labs/flux-kontext-pro",
    label: "Flux Kontext Pro",
    description: "Enhanced context consistency",
    defaultAspectRatio: "4:3",
    slug: "flux-kontext-pro",
    provider: "Flux",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "openai/gpt-image-1.5": {
    id: "openai/gpt-image-1.5",
    label: "GPT Image 1.5",
    description: "OpenAI's flagship image model",
    defaultAspectRatio: "4:3",
    slug: "gpt-image-1-5",
    provider: "OpenAI",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "black-forest-labs/flux-2-pro": {
    id: "black-forest-labs/flux-2-pro",
    label: "Flux 2 Pro",
    description: "Enhanced speed and multi-reference",
    defaultAspectRatio: "4:3",
    slug: "flux-2-pro",
    provider: "Flux",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "google/imagen-4": {
    id: "google/imagen-4",
    label: "Imagen 4",
    description: "High-fidelity photorealism",
    defaultAspectRatio: "16:9",
    slug: "imagen-4",
    provider: "Google",
    features: ["2K"],
    supports: promptOnlySupport,
    buildInput: buildImagenInput,
  },
  "openart/openart-photorealistic": {
    id: "openart/openart-photorealistic",
    label: "OpenArt Photorealistic",
    description: "Lifelike portraits and realistic scene generation",
    defaultAspectRatio: "3:2",
    slug: "openart-photorealistic",
    provider: "OpenArt",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "z-ai/z-image": {
    id: "z-ai/z-image",
    label: "Z-Image",
    description: "Enhanced speed and iteration efficiency",
    defaultAspectRatio: "1:1",
    slug: "z-image",
    provider: "Z.AI",
    features: ["Variations"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "qwen/qwen-image-max": {
    id: "qwen/qwen-image-max",
    label: "qwen-image-max",
    description: "Enhanced realism and naturalness",
    defaultAspectRatio: "1:1",
    slug: "qwen-image-max",
    provider: "Qwen",
    features: ["Open-source"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "qwen/qwen-image-plus": {
    id: "qwen/qwen-image-plus",
    label: "qwen-image-plus",
    description: "Excels at artistic styles and text on image",
    defaultAspectRatio: "1:1",
    slug: "qwen-image-plus",
    provider: "Qwen",
    features: ["Open-source"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "black-forest-labs/flux-2-klein-9b": {
    id: "black-forest-labs/flux-2-klein-9b",
    label: "Flux 2 Klein 9B",
    description: "Enhanced speed and real-time iteration",
    defaultAspectRatio: "4:3",
    slug: "flux-2-klein-9b",
    provider: "Flux",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "black-forest-labs/flux-2-max": {
    id: "black-forest-labs/flux-2-max",
    label: "Flux 2 Max",
    description: "Enhanced prompt adherence and logic",
    defaultAspectRatio: "4:3",
    slug: "flux-2-max",
    provider: "Flux",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "black-forest-labs/flux-2-flex": {
    id: "black-forest-labs/flux-2-flex",
    label: "Flux 2 Flex",
    description: "For design experimentation and iteration",
    defaultAspectRatio: "4:3",
    slug: "flux-2-flex",
    provider: "Flux",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "black-forest-labs/flux-dev": {
    id: "black-forest-labs/flux-dev",
    label: "Flux 1 Dev",
    description: "Enhanced style fine-tuning",
    defaultAspectRatio: "4:3",
    slug: "flux-1-dev",
    provider: "Flux",
    features: ["Variations"],
    supports: {
      negativePrompt: true,
      referenceImage: false,
      seed: true,
      steps: true,
      guidance: true,
    },
    buildInput: buildStandardImageInput,
  },
  "black-forest-labs/flux-1.1-pro": {
    id: "black-forest-labs/flux-1.1-pro",
    label: "Flux 1.1 Pro",
    description: "Enhanced speed and efficiency",
    defaultAspectRatio: "4:3",
    slug: "flux-1-1-pro",
    provider: "Flux",
    features: ["Open-source"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "black-forest-labs/flux-kontext-max": {
    id: "black-forest-labs/flux-kontext-max",
    label: "Flux Kontext Max",
    description: "Enhanced prompt adherence",
    defaultAspectRatio: "4:3",
    slug: "flux-kontext-max",
    provider: "Flux",
    features: ["Reference"],
    supports: referenceSupport,
    buildInput: buildReferenceImageInput,
  },
  "rundiffusion/juggernaut-flux-pro": {
    id: "rundiffusion/juggernaut-flux-pro",
    label: "Juggernaut Flux Pro",
    description: "Enhanced naturalism and fidelity",
    defaultAspectRatio: "3:2",
    slug: "juggernaut-flux-pro",
    provider: "Juggernaut",
    features: ["Variations"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "openart/openart-sdxl": {
    id: "openart/openart-sdxl",
    label: "OpenArt SDXL",
    description: "SDXL tuned for versatile creative imagery",
    defaultAspectRatio: "1:1",
    slug: "openart-sdxl",
    provider: "OpenArt",
    features: ["Variations"],
    supports: {
      negativePrompt: true,
      referenceImage: false,
      seed: true,
      steps: true,
      guidance: true,
    },
    buildInput: buildStandardImageInput,
  },
  "rundiffusion/juggernaut-xl": {
    id: "rundiffusion/juggernaut-xl",
    label: "Juggernaut XL",
    description: "SDXL with strong realism and detail",
    defaultAspectRatio: "1:1",
    slug: "juggernaut-xl",
    provider: "Juggernaut",
    features: ["Variations"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "dynavision/dynavision-xl": {
    id: "dynavision/dynavision-xl",
    label: "DynaVision XL",
    description: "Stylized 3D all-in-one SDXL checkpoint",
    defaultAspectRatio: "1:1",
    slug: "dynavision-xl",
    provider: "DynaVision",
    features: ["Variations"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
  "black-forest-labs/flux-2-lora-gallery-realism": {
    id: "black-forest-labs/flux-2-lora-gallery-realism",
    label: "Flux 2 LoRA Gallery Realism",
    description: "Enhanced photorealism",
    defaultAspectRatio: "3:2",
    slug: "flux-2-lora-gallery-realism",
    provider: "Flux",
    features: ["Variations"],
    supports: promptOnlySupport,
    buildInput: buildStandardImageInput,
  },
};

export function isReplicateImageModelId(
  value: string
): value is ReplicateImageModelId {
  return value in REPLICATE_IMAGE_MODELS;
}

export function isUnavailableReplicateImageModelId(value?: string | null) {
  return !!value && UNAVAILABLE_IMAGE_MODEL_IDS.has(value);
}

export function normalizeReplicateImageModelId(
  modelId?: string | null
): ReplicateImageModelId {
  return modelId && isReplicateImageModelId(modelId)
    ? modelId
    : DEFAULT_IMAGE_MODEL;
}

export function resolveReplicateImageModel(
  modelId?: string | null
): ReplicateImageModelConfig {
  if (modelId && isReplicateImageModelId(modelId)) {
    return REPLICATE_IMAGE_MODELS[modelId];
  }

  const envModel = process.env.REPLICATE_IMAGE_MODEL;

  if (envModel && isReplicateImageModelId(envModel)) {
    return REPLICATE_IMAGE_MODELS[envModel];
  }

  return REPLICATE_IMAGE_MODELS[DEFAULT_IMAGE_MODEL];
}

export function listReplicateImageModels() {
  return Object.values(REPLICATE_IMAGE_MODELS);
}

export function getImageModelUiOptions(
  model: ReplicateImageModelConfig
): ImageModelUiOptions {
  const aspectRatios =
    model.id === "openai/gpt-image-2"
      ? [...GPT_IMAGE_ASPECT_RATIOS]
      : [...STANDARD_IMAGE_ASPECT_RATIOS];
  const optional = [
    model.supports.negativePrompt ? "Negative prompt" : null,
    model.supports.referenceImage ? "Reference image" : null,
    model.supports.seed ? "Seed" : null,
    model.supports.steps ? "Steps" : null,
    model.supports.guidance ? "Guidance" : null,
    "Style prompt",
    "Quality mode",
  ].filter(Boolean) as string[];

  return {
    aspectRatios,
    qualityModes: ["standard", "high", "ultra"],
    required: ["Prompt"],
    optional,
  };
}
