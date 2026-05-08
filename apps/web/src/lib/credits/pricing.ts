export type GenerationType =
  | "image"
  | "video"
  | "audio"
  | "character"
  | "video-project";
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
  imageToVideo?: boolean | null;
  referenceImageUrl?: string | null;
  imageUrl?: string | null;
  endImageUrl?: string | null;
  referenceImageUrls?: string[] | null;
  audioUrl?: string | null;
  qualityMode?: string | null;
  modelBaseCredits?: number | null;
  negativePrompt?: string | null;
  style?: string | null;
  aspectRatio?: string | null;
  promptBoost?: boolean | null;
  seed?: number | null;
  steps?: number | null;
  guidance?: number | null;
  draft?: boolean | null;
  saveAudio?: boolean | null;
  promptUpsampling?: boolean | null;
  disableSafetyFilter?: boolean | null;
  sourceAssetId?: string | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  voiceId?: string | null;
  voicePresetId?: string | null;
  languageCode?: string | null;
  emotion?: string | null;
  speed?: number | null;
  stability?: number | null;
  similarityBoost?: number | null;
  pitch?: number | null;
  volume?: number | null;
  tone?: number | null;
  intensity?: number | null;
  timbre?: number | null;
  audioUploadUrl?: string | null;
  startFrameUrl?: string | null;
  endFrameUrl?: string | null;
  referenceImageCount?: number | null;
  referenceVideoCount?: number | null;
  referenceAudioCount?: number | null;
  settings?: Record<string, unknown> | null;
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
    promptMultiplier: number;
    promptCharacterCount: number;
    settingsMultiplier: number;
    settingCount: number;
    minimumCharge: number;
    reasonLabels: string[];
  };
};

export const CREDIT_PRICING = {
  minimumCharge: 3,
  base: {
    image: 5,
    video: 40,
    audio: 5,
    character: 8,
    "video-project": 24,
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
  promptCharacters: {
    includedCharacters: 80,
    charactersPerStep: 180,
    multiplierStep: 0.045,
    multiplierCap: 1.55,
    negativePromptWeight: 0.6,
  },
  settings: {
    multiplierCap: 2.35,
    referenceImage: 0.08,
    referenceVideo: 0.1,
    referenceAudio: 0.1,
    startFrame: 0.12,
    endFrame: 0.12,
    sourceAsset: 0.06,
    style: 0.06,
    aspectRatio: 0.04,
    promptBoost: 0.05,
    negativePrompt: 0.08,
    seed: 0.03,
    steps: 0.05,
    guidance: 0.05,
    draftDiscount: -0.12,
    saveAudio: 0.06,
    promptUpsampling: 0.08,
    relaxedSafety: 0.1,
    motion: 0.08,
    cameraMove: 0.08,
    styleStrength: 0.06,
    motionGuidance: 0.06,
    shotType: 0.06,
    fps: 0.05,
    voice: 0.04,
    language: 0.04,
    emotion: 0.04,
    audioControl: 0.035,
    projectScene: 0.04,
  },
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
  const base = Math.max(
    CREDIT_PRICING.base[generationType],
    Math.ceil(input.modelBaseCredits ?? 0)
  );
  const reasonLabels: string[] = [];

  const modelTier = input.modelTier ?? inferModelTier(input.modelId);
  const modelMultiplier = CREDIT_PRICING.modelMultipliers[modelTier];
  if (modelTier !== "standard") {
    reasonLabels.push(`${modelTier} model`);
  }

  const durationMultiplier =
    generationType === "video" ||
    generationType === "audio" ||
    generationType === "video-project"
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
  const negativePrompt = input.negativePrompt?.trim() ?? "";
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

  const promptCharacterCount =
    prompt.length +
    Math.ceil(
      negativePrompt.length * CREDIT_PRICING.promptCharacters.negativePromptWeight
    );
  const extraPromptCharacters = Math.max(
    0,
    promptCharacterCount - CREDIT_PRICING.promptCharacters.includedCharacters
  );
  const promptMultiplier = Math.min(
    1 +
      Math.ceil(
        extraPromptCharacters / CREDIT_PRICING.promptCharacters.charactersPerStep
      ) *
        CREDIT_PRICING.promptCharacters.multiplierStep,
    CREDIT_PRICING.promptCharacters.multiplierCap
  );
  if (promptMultiplier > 1) {
    reasonLabels.push(`${promptCharacterCount} prompt chars`);
  }

  const hasImageInput = Boolean(
    input.imageToVideo ||
      input.referenceImageUrl ||
      input.imageUrl ||
      input.endImageUrl ||
      input.referenceImageUrls?.length
  );

  const settingCharges: number[] = [];
  const addSettingCharge = (
    active: boolean,
    amount: number,
    label: string
  ) => {
    if (!active) return;
    settingCharges.push(amount);
    if (amount > 0) reasonLabels.push(label);
  };

  const referenceImageCount =
    input.referenceImageCount ??
    (input.referenceImageUrls?.length ?? 0) +
      (input.referenceImageUrl ? 1 : 0) +
      (input.imageUrl ? 1 : 0);
  const referenceVideoCount = input.referenceVideoCount ?? 0;
  const referenceAudioCount =
    input.referenceAudioCount ?? (input.audioUrl || input.audioUploadUrl ? 1 : 0);

  addSettingCharge(
    referenceImageCount > 0,
    Math.min(referenceImageCount * CREDIT_PRICING.settings.referenceImage, 0.4),
    `${referenceImageCount} image reference${referenceImageCount === 1 ? "" : "s"}`
  );
  addSettingCharge(
    referenceVideoCount > 0,
    Math.min(referenceVideoCount * CREDIT_PRICING.settings.referenceVideo, 0.35),
    "video reference"
  );
  addSettingCharge(
    referenceAudioCount > 0,
    Math.min(referenceAudioCount * CREDIT_PRICING.settings.referenceAudio, 0.3),
    "audio reference"
  );
  addSettingCharge(Boolean(input.endImageUrl || input.endFrameUrl), CREDIT_PRICING.settings.endFrame, "end frame");
  addSettingCharge(Boolean(input.startFrameUrl), CREDIT_PRICING.settings.startFrame, "start frame");
  addSettingCharge(Boolean(input.sourceAssetId), CREDIT_PRICING.settings.sourceAsset, "source asset");
  addSettingCharge(Boolean(input.style), CREDIT_PRICING.settings.style, "style");
  addSettingCharge(Boolean(input.aspectRatio), CREDIT_PRICING.settings.aspectRatio, "aspect ratio");
  addSettingCharge(input.promptBoost === true, CREDIT_PRICING.settings.promptBoost, "prompt boost");
  addSettingCharge(Boolean(negativePrompt), CREDIT_PRICING.settings.negativePrompt, "negative prompt");
  addSettingCharge(input.seed !== null && input.seed !== undefined, CREDIT_PRICING.settings.seed, "seed");
  addSettingCharge(Boolean(input.steps), CREDIT_PRICING.settings.steps, "steps");
  addSettingCharge(Boolean(input.guidance), CREDIT_PRICING.settings.guidance, "guidance");
  addSettingCharge(input.draft === true, CREDIT_PRICING.settings.draftDiscount, "draft");
  addSettingCharge(input.saveAudio === true, CREDIT_PRICING.settings.saveAudio, "audio export");
  addSettingCharge(input.promptUpsampling === true, CREDIT_PRICING.settings.promptUpsampling, "prompt upsampling");
  addSettingCharge(input.disableSafetyFilter === true, CREDIT_PRICING.settings.relaxedSafety, "relaxed safety");
  addSettingCharge(Boolean(input.motionIntensity), CREDIT_PRICING.settings.motion, "motion");
  addSettingCharge(Boolean(input.cameraMove), CREDIT_PRICING.settings.cameraMove, "camera move");
  addSettingCharge(Boolean(input.styleStrength), CREDIT_PRICING.settings.styleStrength, "style strength");
  addSettingCharge(Boolean(input.motionGuidance), CREDIT_PRICING.settings.motionGuidance, "motion guidance");
  addSettingCharge(Boolean(input.shotType), CREDIT_PRICING.settings.shotType, "shot type");
  addSettingCharge(Boolean(input.fps), CREDIT_PRICING.settings.fps, "fps");
  addSettingCharge(Boolean(input.voiceId || input.voicePresetId), CREDIT_PRICING.settings.voice, "voice");
  addSettingCharge(Boolean(input.languageCode), CREDIT_PRICING.settings.language, "language");
  addSettingCharge(Boolean(input.emotion), CREDIT_PRICING.settings.emotion, "emotion");

  const audioControlCount = [
    input.speed,
    input.stability,
    input.similarityBoost,
    input.pitch,
    input.volume,
    input.tone,
    input.intensity,
    input.timbre,
  ].filter((value) => value !== null && value !== undefined).length;
  addSettingCharge(
    audioControlCount > 0,
    Math.min(audioControlCount * CREDIT_PRICING.settings.audioControl, 0.25),
    "voice controls"
  );

  const completedSceneCount =
    typeof input.settings?.completedSceneCount === "number"
      ? input.settings.completedSceneCount
      : 0;
  addSettingCharge(
    completedSceneCount > 0,
    Math.min(completedSceneCount * CREDIT_PRICING.settings.projectScene, 0.75),
    `${completedSceneCount} project scenes`
  );

  const settingsAdjustment = settingCharges.reduce((sum, amount) => sum + amount, 0);
  const settingsMultiplier = Math.min(
    Math.max(1 + settingsAdjustment, 0.75),
    CREDIT_PRICING.settings.multiplierCap
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
    promptMultiplier *
    settingsMultiplier *
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
      promptMultiplier: Number(promptMultiplier.toFixed(3)),
      promptCharacterCount,
      settingsMultiplier: Number(settingsMultiplier.toFixed(3)),
      settingCount: settingCharges.length,
      minimumCharge: CREDIT_PRICING.minimumCharge,
      reasonLabels,
    },
  };
}
