export type GenerationMode = "image" | "video" | "character" | "audio" | "story";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type PromptIntent =
  | "cinematic"
  | "image"
  | "video"
  | "character"
  | "story"
  | "audio"
  | "general";

export type PromptEnhancementInput = {
  prompt: string;
  mode?: GenerationMode;
  modelId?: string | null;
  providerName?: string | null;
  style?: string | null;
  aspectRatio?: string | null;
  negativePrompt?: string | null;
  preserveWording?: boolean;
};

export type PromptEnhancementResult = {
  rawPrompt: string;
  enhancedPrompt: string;
  negativePrompt?: string;
  intent: PromptIntent;
  warnings: string[];
  metadata: {
    engine: "local-deterministic";
    version: string;
    afroCinematic: boolean;
    modelFormatted: boolean;
  };
};

export type CharacterMemory = {
  id?: string;
  name?: string | null;
  description?: string | null;
  visualTraits?: string | null;
  outfit?: string | null;
  style?: string | null;
  voiceNotes?: string | null;
  referenceImageUrl?: string | null;
  preferredPromptFragment?: string | null;
};

export type StoryMemory = {
  id?: string;
  title?: string | null;
  genre?: string | null;
  tone?: string | null;
  worldSetting?: string | null;
  characters?: unknown;
  previousSceneSummaries?: unknown;
  nextSceneNotes?: string | null;
};

export type GenerationContextInput = {
  rawPrompt: string;
  generationMode: GenerationMode;
  providerName?: string | null;
  modelId?: string | null;
  negativePrompt?: string | null;
  style?: string | null;
  aspectRatio?: string | null;
  characterMemory?: CharacterMemory | null;
  storyMemory?: StoryMemory | null;
  enhance?: boolean;
};

export type GenerationContext = {
  rawPrompt: string;
  enhancedPrompt: string;
  finalPrompt: string;
  negativePrompt?: string;
  metadata: {
    promptEngineVersion: string;
    intent: PromptIntent;
    generationMode: GenerationMode;
    characterMemoryId?: string;
    storyMemoryId?: string;
    usedPromptEnhancement: boolean;
  };
  providerHints: {
    providerName?: string | null;
    modelId?: string | null;
    modelFormatted: boolean;
  };
  estimatedComplexity: "low" | "medium" | "high";
  warnings: string[];
};
