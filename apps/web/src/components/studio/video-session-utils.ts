export type VideoStudioMeaningfulState = {
  prompt: string;
  negativePrompt: string;
  draftTitle?: string;
  duration: string;
  aspectRatio: string;
  motionIntensity: string;
  cameraMove: string;
  styleStrength: string;
  motionGuidance: number;
  shotType: string;
  fps: string;
  imageUrl?: string;
  sourceAssetId?: string;
};

export function hasMeaningfulVideoStudioState(
  state: VideoStudioMeaningfulState
) {
  return Boolean(
    state.prompt.trim() ||
      state.negativePrompt.trim() ||
      state.draftTitle?.trim() ||
      state.duration !== "5" ||
      state.aspectRatio !== "16:9" ||
      state.motionIntensity !== "medium" ||
      state.cameraMove !== "Slow Push In" ||
      state.styleStrength !== "medium" ||
      state.motionGuidance !== 6 ||
      state.shotType !== "Wide Shot" ||
      state.fps !== "24" ||
      Boolean(state.imageUrl?.trim()) ||
      Boolean(state.sourceAssetId?.trim())
  );
}
