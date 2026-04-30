import type { StudioGenerationSetup } from "./types";

export const STUDIO_SESSION_KEY = "vireon_studio_session_state";
export const VIDEO_STUDIO_SESSION_KEY = "vireon_video_studio_session_state";

export type StudioSessionState = StudioGenerationSetup & {
  draftTitle: string;
};

export type VideoStudioSessionState = {
  modelId: string;
  prompt: string;
  negativePrompt: string;
  resolution?: string;
  draftMode?: boolean;
  saveAudio?: boolean;
  promptUpsampling?: boolean;
  disableSafetyFilter?: boolean;
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
  draftTitle: string;
};

export function saveStudioSessionState(state: StudioSessionState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STUDIO_SESSION_KEY, JSON.stringify(state));
}

export function loadStudioSessionState(): StudioSessionState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STUDIO_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StudioSessionState;
  } catch {
    return null;
  }
}

export function clearStudioSessionState() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STUDIO_SESSION_KEY);
}

export function saveVideoStudioSessionState(state: VideoStudioSessionState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(VIDEO_STUDIO_SESSION_KEY, JSON.stringify(state));
}

export function loadVideoStudioSessionState(): VideoStudioSessionState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(VIDEO_STUDIO_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as VideoStudioSessionState;
  } catch {
    return null;
  }
}

export function clearVideoStudioSessionState() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(VIDEO_STUDIO_SESSION_KEY);
}
