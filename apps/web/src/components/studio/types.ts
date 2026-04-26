export type QualityMode = "standard" | "high" | "ultra";

export type StudioGenerationSetup = {
  prompt: string;
  negativePrompt: string;
  style: string;
  aspectRatio: string;
  qualityMode: QualityMode;
  promptBoost: boolean;
  seed: number | null;
  steps: number;
  guidance: number;
};
