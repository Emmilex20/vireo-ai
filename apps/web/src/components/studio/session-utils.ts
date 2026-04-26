import type { StudioGenerationSetup } from "./types";

export function hasMeaningfulStudioState(
  state: StudioGenerationSetup & { draftTitle?: string }
) {
  return Boolean(
    state.prompt.trim() ||
      state.negativePrompt.trim() ||
      state.draftTitle?.trim() ||
      state.style !== "Cinematic" ||
      state.aspectRatio !== "4:3" ||
      state.qualityMode !== "high" ||
      state.promptBoost !== true ||
      state.seed !== null ||
      state.steps !== 30 ||
      state.guidance !== 7.5
  );
}
