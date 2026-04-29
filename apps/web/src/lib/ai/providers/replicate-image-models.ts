import type { ImageGenerationInput } from "./types";

export type ReplicateImageModelId =
  | "black-forest-labs/flux-schnell"
  | "google/imagen-4-ultra"
  | "bytedance/seedream-4.5"
  | "ideogram-ai/ideogram-v3-quality";

type ReplicateImageModelConfig = {
  id: ReplicateImageModelId;
  label: string;
  description: string;
  defaultAspectRatio: string;
  supports: {
    negativePrompt: boolean;
    referenceImage: boolean;
    seed: boolean;
    steps: boolean;
    guidance: boolean;
  };
  buildInput: (input: ImageGenerationInput) => Record<string, unknown>;
};

const DEFAULT_IMAGE_MODEL: ReplicateImageModelId =
  "black-forest-labs/flux-schnell";

function mapAspectRatio(aspectRatio?: string) {
  const supported = ["1:1", "16:9", "9:16", "4:3", "3:4"];

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

function buildImagenPrompt(input: ImageGenerationInput) {
  const prompt = buildPrompt(input);

  if (!input.negativePrompt?.trim()) {
    return prompt;
  }

  return `${prompt}. Avoid: ${input.negativePrompt.trim()}.`;
}

export const REPLICATE_IMAGE_MODELS: Record<
  ReplicateImageModelId,
  ReplicateImageModelConfig
> = {
  "black-forest-labs/flux-schnell": {
    id: "black-forest-labs/flux-schnell",
    label: "Flux Schnell",
    description: "Fastest option for quick ideation and prompt iteration.",
    defaultAspectRatio: "4:3",
    supports: {
      negativePrompt: true,
      referenceImage: false,
      seed: true,
      steps: false,
      guidance: false,
    },
    buildInput(input) {
      return {
        prompt: buildPrompt(input),
        negative_prompt: buildNegativePrompt(input.negativePrompt),
        num_outputs: 1,
        aspect_ratio: mapAspectRatio(input.aspectRatio),
        output_format: "webp",
        safety_tolerance: 2,
        seed: input.seed ?? undefined,
      };
    },
  },
  "google/imagen-4-ultra": {
    id: "google/imagen-4-ultra",
    label: "Imagen 4 Ultra",
    description: "High-end realism and typography-friendly polished outputs.",
    defaultAspectRatio: "16:9",
    supports: {
      negativePrompt: false,
      referenceImage: false,
      seed: false,
      steps: false,
      guidance: false,
    },
    buildInput(input) {
      return {
        prompt: buildImagenPrompt(input),
        image_size: "1K",
        aspect_ratio: mapAspectRatio(input.aspectRatio),
        output_format: "jpg",
        safety_filter_level: "block_only_high",
      };
    },
  },
  "bytedance/seedream-4.5": {
    id: "bytedance/seedream-4.5",
    label: "Seedream 4.5",
    description: "Strong world detail and reference-image guided composition.",
    defaultAspectRatio: "16:9",
    supports: {
      negativePrompt: false,
      referenceImage: true,
      seed: false,
      steps: false,
      guidance: false,
    },
    buildInput(input) {
      return {
        prompt: buildImagenPrompt(input),
        size: "4K",
        max_images: 1,
        image_input: input.referenceImageUrl ? [input.referenceImageUrl] : [],
        aspect_ratio: mapAspectRatio(input.aspectRatio),
        sequential_image_generation: "disabled",
      };
    },
  },
  "ideogram-ai/ideogram-v3-quality": {
    id: "ideogram-ai/ideogram-v3-quality",
    label: "Ideogram v3 Quality",
    description: "Excellent for text-in-image, branding, and polished composition.",
    defaultAspectRatio: "3:2",
    supports: {
      negativePrompt: false,
      referenceImage: false,
      seed: false,
      steps: false,
      guidance: false,
    },
    buildInput(input) {
      return {
        prompt: buildImagenPrompt(input),
        resolution: "None",
        style_type: "None",
        aspect_ratio: input.aspectRatio && input.aspectRatio !== "1:1"
          ? input.aspectRatio
          : "3:2",
        style_preset: "None",
        magic_prompt_option: "Off",
      };
    },
  },
};

export function isReplicateImageModelId(
  value: string
): value is ReplicateImageModelId {
  return value in REPLICATE_IMAGE_MODELS;
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
