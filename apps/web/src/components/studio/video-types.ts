export type VideoReusePayload = {
  prompt: string;
  negativePrompt: string;
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

export type VideoGenerationSetup = {
  prompt: string;
  negativePrompt: string;
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
