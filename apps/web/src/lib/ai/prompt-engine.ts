import type {
  GenerationMode,
  PromptEnhancementInput,
  PromptEnhancementResult,
  PromptIntent,
} from "./types";

const PROMPT_ENGINE_VERSION = "level2-local-v1";

const CINEMATIC_TERMS = [
  "cinematic",
  "camera",
  "dramatic",
  "film",
  "movie",
  "scene",
  "shot",
  "trailer",
];

const CHARACTER_TERMS = [
  "character",
  "hero",
  "villain",
  "warrior",
  "portrait",
  "person",
  "face",
];

const VIDEO_TERMS = [
  "motion",
  "movement",
  "walks",
  "runs",
  "flies",
  "speaking",
  "saying",
  "camera move",
];

const AFRO_CINEMATIC_TERMS = [
  "afro",
  "african",
  "lagos",
  "nigeria",
  "nigerian",
  "nollywood",
  "yoruba",
  "igbo",
  "hausa",
  "abuja",
  "ankara",
  "aso oke",
  "gele",
];

function cleanPrompt(prompt: string) {
  return prompt.replace(/\s+/g, " ").trim();
}

function includesAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();

  return terms.some((term) => normalized.includes(term));
}

function uniqueSegments(segments: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return segments
    .map((segment) => cleanPrompt(segment ?? ""))
    .filter(Boolean)
    .filter((segment) => {
      const key = segment.toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function detectPromptIntent(input: PromptEnhancementInput): PromptIntent {
  const prompt = cleanPrompt(input.prompt);
  const lowerPrompt = prompt.toLowerCase();

  if (!prompt) return "general";
  if (input.mode === "character" || includesAny(lowerPrompt, CHARACTER_TERMS)) {
    return "character";
  }
  if (input.mode === "video" || includesAny(lowerPrompt, VIDEO_TERMS)) {
    return "video";
  }
  if (input.mode === "image") return "image";
  if (input.mode === "audio") return "audio";
  if (input.mode === "story") return "story";
  if (includesAny(lowerPrompt, CINEMATIC_TERMS)) return "cinematic";

  return "general";
}

export function buildNegativePrompt(input: PromptEnhancementInput) {
  const base = [
    "low quality",
    "blurry",
    "distorted anatomy",
    "extra limbs",
    "bad hands",
    "deformed face",
    "watermark",
    "logo",
    "unreadable text",
  ];

  if (input.mode === "video") {
    base.push("flicker", "warped motion", "jitter", "morphing face");
  }

  if (input.mode === "character") {
    base.push("inconsistent identity", "different face", "duplicate character");
  }

  return uniqueSegments([input.negativePrompt, base.join(", ")]).join(", ");
}

function buildModeDescriptors(input: PromptEnhancementInput, intent: PromptIntent) {
  const descriptors: string[] = [];

  if (input.mode === "video" || intent === "video") {
    descriptors.push(
      "clear subject motion",
      "coherent temporal continuity",
      "stable identity across frames",
      "cinematic camera language"
    );
  } else if (input.mode === "image" || intent === "image") {
    descriptors.push(
      "production-ready composition",
      "precise lighting",
      "rich surface texture",
      "high-end visual detail"
    );
  } else if (input.mode === "character" || intent === "character") {
    descriptors.push(
      "consistent facial identity",
      "recognizable silhouette",
      "clear costume language",
      "character reference quality"
    );
  } else if (intent === "cinematic") {
    descriptors.push(
      "cinematic atmosphere",
      "intentional composition",
      "dramatic lighting"
    );
  }

  if (input.style) {
    descriptors.push(`${input.style} style`);
  }

  if (input.aspectRatio) {
    descriptors.push(`${input.aspectRatio} framing`);
  }

  return descriptors;
}

function buildModelDescriptors(input: PromptEnhancementInput) {
  const modelId = input.modelId?.toLowerCase() ?? "";
  const descriptors: string[] = [];

  if (modelId.includes("kling")) {
    descriptors.push("natural motion", "physically plausible action", "cinematic realism");
  } else if (modelId.includes("veo") || modelId.includes("sora")) {
    descriptors.push("strong narrative continuity", "film-grade realism");
  } else if (modelId.includes("gpt-image") || modelId.includes("imagen")) {
    descriptors.push("sharp visual hierarchy", "clean prompt adherence");
  }

  return descriptors;
}

export function enhancePrompt(
  input: PromptEnhancementInput
): PromptEnhancementResult {
  const rawPrompt = cleanPrompt(input.prompt);
  const warnings: string[] = [];

  if (rawPrompt.length < 5) {
    return {
      rawPrompt,
      enhancedPrompt: rawPrompt,
      negativePrompt: input.negativePrompt ?? undefined,
      intent: "general",
      warnings: ["Prompt is too short for enhancement."],
      metadata: {
        engine: "local-deterministic",
        version: PROMPT_ENGINE_VERSION,
        afroCinematic: false,
        modelFormatted: false,
      },
    };
  }

  const intent = detectPromptIntent(input);
  const afroCinematic = includesAny(rawPrompt, AFRO_CINEMATIC_TERMS);
  const modeDescriptors = buildModeDescriptors(input, intent);
  const modelDescriptors = buildModelDescriptors(input);
  const culturalDescriptors = afroCinematic
    ? [
        "Afro-cinematic visual language",
        "grounded African cultural texture",
        "authentic regional styling where appropriate",
      ]
    : [];

  if (rawPrompt.length > 900) {
    warnings.push("Prompt is already detailed; enhancement was kept minimal.");
  }

  const enhancedPrompt = uniqueSegments([
    rawPrompt,
    ...modeDescriptors,
    ...modelDescriptors,
    ...culturalDescriptors,
    "avoid generic stock imagery",
    "preserve the user's core subject and action",
  ]).join(", ");

  return {
    rawPrompt,
    enhancedPrompt,
    negativePrompt: buildNegativePrompt(input),
    intent,
    warnings,
    metadata: {
      engine: "local-deterministic",
      version: PROMPT_ENGINE_VERSION,
      afroCinematic,
      modelFormatted: modelDescriptors.length > 0,
    },
  };
}

export function isVisualGenerationMode(mode: GenerationMode) {
  return mode === "image" || mode === "video" || mode === "character";
}
