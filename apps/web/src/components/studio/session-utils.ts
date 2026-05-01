import type { StudioGenerationSetup } from "./types";

export function hasMeaningfulStudioState(
  state: StudioGenerationSetup & { draftTitle?: string }
) {
  return Boolean(
    state.prompt.trim() ||
      state.negativePrompt.trim() ||
      state.referenceImageUrl.trim() ||
      state.draftTitle?.trim() ||
      state.modelId !== "openai/gpt-image-2" ||
      state.style !== "Cinematic" ||
      state.aspectRatio !== "1:1" ||
      state.qualityMode !== "high" ||
      state.promptBoost !== true ||
      state.seed !== null ||
      state.steps !== 30 ||
      state.guidance !== 7.5
  );
}
