export type ProviderJobResult = {
  providerJobId: string;
  status: "processing" | "completed" | "failed";
  outputUrl?: string;
};

export type ProviderJobStatus = {
  status: "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
};

export type ImageGenerationInput = {
  prompt: string;
  negativePrompt?: string;
  modelId?: string;
  referenceImageUrl?: string;
  style?: string;
  aspectRatio?: string;
  qualityMode?: string;
  promptBoost?: boolean;
  seed?: number | null;
  steps?: number;
  guidance?: number;
};

export type VideoGenerationInput = {
  prompt: string;
  negativePrompt?: string;
  modelId?: string;
  resolution?: string;
  draft?: boolean;
  saveAudio?: boolean;
  promptUpsampling?: boolean;
  disableSafetyFilter?: boolean;
  noOp?: boolean;
  seed?: number | null;
  duration?: number;
  aspectRatio?: string;
  motionIntensity?: string;
  cameraMove?: string;
  styleStrength?: string;
  motionGuidance?: number;
  shotType?: string;
  fps?: number;
  imageUrl?: string;
  endImageUrl?: string;
  referenceImageUrls?: string[];
  audioUrl?: string;
};

export type ImageProvider = {
  name: string;
  createImageJob(input: ImageGenerationInput): Promise<ProviderJobResult>;
  getImageJobStatus(providerJobId: string): Promise<ProviderJobStatus>;
};

export type VideoProvider = {
  name: string;
  createVideoJob(input: VideoGenerationInput): Promise<ProviderJobResult>;
  getVideoJobStatus(providerJobId: string): Promise<ProviderJobStatus>;
};
