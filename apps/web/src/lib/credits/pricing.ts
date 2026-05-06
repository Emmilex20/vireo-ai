export type GenerationType = "image" | "video" | "audio";
export type ModelTier = "cheap" | "standard" | "premium";
export type CreditResolution = "low" | "medium" | "high" | "hd";

export type GenerationCreditInput = {
  generationType: GenerationType;
  modelTier?: ModelTier;
  modelId?: string | null;
  prompt?: string | null;
  durationSeconds?: number | null;
  resolution?: CreditResolution | string | null;
  numberOfOutputs?: number | null;
  imageToVideo?: boolean;
  referenceImageUrl?: string | null;
  imageUrl?: string | null;
  endImageUrl?: string | null;
  referenceImageUrls?: string[] | null;
  audioUrl?: string | null;
  qualityMode?: string | null;
};

export type GenerationCreditQuote = {
  credits: number;
  breakdown: {
    base: number;
    modelMultiplier: number;
    durationMultiplier: number;
    resolutionMultiplier: number;
    outputMultiplier: number;
    complexityMultiplier: number;
    reasonLabels: string[];
  };
};

export const CREDIT_PRICING = {
  minimumCharge: 3,
  base: {
    image: 5,
    video: 40,
    audio: 5,
  },
  modelMultipliers: {
    cheap: 0.85,
    standard: 1,
    premium: 1.35,
  },
  durationBaseSeconds: 5,
  durationMultiplierCap: 4,
  resolutionMultipliers: {
    low: 0.85,
    medium: 1,
    high: 1.2,
    hd: 1.45,
  },
  outputMultiplierStep: 0.9,
  imageToVideoMultiplier: 1.25,
  audioVideoMultiplier: 1.12,
  promptComplexity: {
    shortWordLimit: 12,
    longWordLimit: 45,
    veryLongWordLimit: 90,
    shortMultiplier: 0.9,
    normalMultiplier: 1,
    longMultiplier: 1.12,
    veryLongMultiplier: 1.25,
    keywordMultiplierStep: 0.05,
    keywordMultiplierCap: 1.25,
    keywords: [
      "cinematic",
      "realistic",
      "photorealistic",
      "4k",
      "8k",
      "ultra detailed",
      "ultra-detailed",
      "lip sync",
      "lipsync",
      "product ad",
      "commercial",
      "camera movement",
      "camera move",
      "dolly",
      "tracking shot",
      "crane shot",
      "slow push",
      "motion",
    ],
  },
} as const;

const PREMIUM_MODEL_HINTS = [
  "gpt-image",
  "imagen",
  "veo",
  "sora",
  "kling-v3",
  "seedance-2",
  "flux-2-max",
  "nano-banana-pro",
  "elevenlabs/v3",
  "speech-2.8-hd",
];

const CHEAP_MODEL_HINTS = [
  "fast",
  "lite",
  "klein",
  "dev",
  "p-video",
  "z-image",
  "openart",
  "turbo",
];

export function inferModelTier(modelId?: string | null): ModelTier {
  const normalized = modelId?.toLowerCase() ?? "";

  if (PREMIUM_MODEL_HINTS.some((hint) => normalized.includes(hint))) {
    return "premium";
  }

  if (CHEAP_MODEL_HINTS.some((hint) => normalized.includes(hint))) {
    return "cheap";
  }

  return "standard";
}

export function normalizeCreditResolution(
  value?: string | null,
  qualityMode?: string | null
): CreditResolution {
  const normalized = (value ?? qualityMode ?? "").toLowerCase();

  if (["hd", "4k", "2160p", "ultra"].includes(normalized)) return "hd";
  if (["high", "1080p", "2k"].includes(normalized)) return "high";
  if (["low", "480p", "540p", "standard"].includes(normalized)) return "low";

  return "medium";
}

export function calculateGenerationCredits(
  input: GenerationCreditInput
): GenerationCreditQuote {
  const generationType = input.generationType;
  const base = CREDIT_PRICING.base[generationType];
  const reasonLabels: string[] = [];

  const modelTier = input.modelTier ?? inferModelTier(input.modelId);
  const modelMultiplier = CREDIT_PRICING.modelMultipliers[modelTier];
  if (modelTier !== "standard") {
    reasonLabels.push(`${modelTier} model`);
  }

  const durationMultiplier =
    generationType === "video" || generationType === "audio"
      ? Math.min(
          Math.max(
            (input.durationSeconds ?? CREDIT_PRICING.durationBaseSeconds) /
              CREDIT_PRICING.durationBaseSeconds,
            1
          ),
          CREDIT_PRICING.durationMultiplierCap
        )
      : 1;
  if (durationMultiplier > 1) {
    reasonLabels.push(`${input.durationSeconds}s duration`);
  }

  const resolution = normalizeCreditResolution(
    input.resolution,
    input.qualityMode
  );
  const resolutionMultiplier = CREDIT_PRICING.resolutionMultipliers[resolution];
  if (resolution !== "medium") {
    reasonLabels.push(`${resolution} resolution`);
  }

  const outputs = Math.max(1, Math.floor(input.numberOfOutputs ?? 1));
  const outputMultiplier =
    outputs === 1 ? 1 : 1 + (outputs - 1) * CREDIT_PRICING.outputMultiplierStep;
  if (outputs > 1) {
    reasonLabels.push(`${outputs} outputs`);
  }

  const prompt = input.prompt?.trim() ?? "";
  const wordCount = prompt ? prompt.split(/\s+/).length : 0;
  let complexityMultiplier: number = CREDIT_PRICING.promptComplexity.normalMultiplier;

  if (wordCount > CREDIT_PRICING.promptComplexity.veryLongWordLimit) {
    complexityMultiplier = CREDIT_PRICING.promptComplexity.veryLongMultiplier;
    reasonLabels.push("very detailed prompt");
  } else if (wordCount > CREDIT_PRICING.promptComplexity.longWordLimit) {
    complexityMultiplier = CREDIT_PRICING.promptComplexity.longMultiplier;
    reasonLabels.push("detailed prompt");
  } else if (wordCount > 0 && wordCount <= CREDIT_PRICING.promptComplexity.shortWordLimit) {
    complexityMultiplier = CREDIT_PRICING.promptComplexity.shortMultiplier;
    reasonLabels.push("simple prompt");
  }

  const lowerPrompt = prompt.toLowerCase();
  const keywordMatches = CREDIT_PRICING.promptComplexity.keywords.filter((keyword) =>
    lowerPrompt.includes(keyword)
  );

  if (keywordMatches.length) {
    complexityMultiplier *= Math.min(
      1 + keywordMatches.length * CREDIT_PRICING.promptComplexity.keywordMultiplierStep,
      CREDIT_PRICING.promptComplexity.keywordMultiplierCap
    );
    reasonLabels.push("premium prompt details");
  }

  const hasImageInput = Boolean(
    input.imageToVideo ||
      input.referenceImageUrl ||
      input.imageUrl ||
      input.endImageUrl ||
      input.referenceImageUrls?.length
  );

  let modalityMultiplier = 1;
  if (generationType === "video" && hasImageInput) {
    modalityMultiplier *= CREDIT_PRICING.imageToVideoMultiplier;
    reasonLabels.push("image-to-video input");
  }

  if (generationType === "video" && input.audioUrl) {
    modalityMultiplier *= CREDIT_PRICING.audioVideoMultiplier;
    reasonLabels.push("audio input");
  }

  const rawCredits =
    base *
    modelMultiplier *
    durationMultiplier *
    resolutionMultiplier *
    outputMultiplier *
    complexityMultiplier *
    modalityMultiplier;

  return {
    credits: Math.max(CREDIT_PRICING.minimumCharge, Math.ceil(rawCredits)),
    breakdown: {
      base,
      modelMultiplier,
      durationMultiplier,
      resolutionMultiplier,
      outputMultiplier,
      complexityMultiplier: Number((complexityMultiplier * modalityMultiplier).toFixed(3)),
      reasonLabels,
    },
  };
}
