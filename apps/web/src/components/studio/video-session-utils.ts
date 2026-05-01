import { resolveReplicateVideoModel } from "@/lib/ai/providers/replicate-video-models";

export type VideoStudioMeaningfulState = {
  modelId: string;
  prompt: string;
  negativePrompt: string;
  resolution?: string;
  draftMode?: boolean;
  saveAudio?: boolean;
  promptUpsampling?: boolean;
  disableSafetyFilter?: boolean;
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
  endImageUrl?: string;
  referenceImageUrls?: string[];
  audioUrl?: string;
  sourceAssetId?: string;
};

export function hasMeaningfulVideoStudioState(
  state: VideoStudioMeaningfulState
) {
  const defaultModel = resolveReplicateVideoModel(state.modelId);

  return Boolean(
    state.prompt.trim() ||
      state.negativePrompt.trim() ||
      state.draftTitle?.trim() ||
      (state.resolution ?? defaultModel.defaultResolution ?? "720p") !==
        (defaultModel.defaultResolution ?? "720p") ||
      Boolean(state.draftMode) ||
      (state.saveAudio ?? defaultModel.supports.audioGeneration) !==
        defaultModel.supports.audioGeneration ||
      Boolean(state.promptUpsampling) ||
      state.disableSafetyFilter !== true ||
      state.duration !== String(defaultModel.defaultDuration) ||
      state.aspectRatio !== defaultModel.defaultAspectRatio ||
      state.motionIntensity !== "medium" ||
      state.cameraMove !== "Slow Push In" ||
      state.styleStrength !== "medium" ||
      state.motionGuidance !== 6 ||
      state.shotType !== "Wide Shot" ||
      state.fps !== "24" ||
      Boolean(state.imageUrl?.trim()) ||
      Boolean(state.endImageUrl?.trim()) ||
      Boolean(state.referenceImageUrls?.length) ||
      Boolean(state.audioUrl?.trim()) ||
      Boolean(state.sourceAssetId?.trim())
  );
}
