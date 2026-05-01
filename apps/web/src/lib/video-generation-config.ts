export const VIDEO_DURATION_OPTIONS = [5, 10, 15, 20] as const;

const BASE_VIDEO_COST = 40;
const BASE_VIDEO_DURATION = 5;
const DEFAULT_MOTION_GUIDANCE = 6;
const VIDEO_MODEL_SURCHARGES: Record<string, number> = {
  "runwayml/gen-4.5": 0,
  "prunaai/p-video": 0,
  "bytedance/seedance-2.0": 30,
  "kwaivgi/kling-v3-omni-video": 30,
  "kwaivgi/kling-v3": 25,
  "google/veo-3.1": 35,
  "google/veo-3": 30,
  "openai/sora-2": 30,
  "lightricks/ltx-video-2.3": 20,
  "bytedance/seedance-1.5-pro": 15,
};

type VideoGenerationCostInput = {
  modelId?: string | null;
  duration: number;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  fps?: number | null;
};

export function isSupportedVideoDuration(value: number) {
  return VIDEO_DURATION_OPTIONS.includes(
    value as (typeof VIDEO_DURATION_OPTIONS)[number]
  );
}

export function getVideoGenerationCost(input: VideoGenerationCostInput) {
  const normalizedDuration = isSupportedVideoDuration(input.duration)
    ? input.duration
    : BASE_VIDEO_DURATION;

  let cost = (normalizedDuration / BASE_VIDEO_DURATION) * BASE_VIDEO_COST;
  cost += VIDEO_MODEL_SURCHARGES[input.modelId ?? ""] ?? 0;

  if (input.styleStrength === "high") {
    cost += 10;
  }

  if ((input.motionGuidance ?? DEFAULT_MOTION_GUIDANCE) > DEFAULT_MOTION_GUIDANCE) {
    const guidance = input.motionGuidance ?? DEFAULT_MOTION_GUIDANCE;
    cost += guidance >= 9 ? 10 : 5;
  }

  if ((input.fps ?? 24) === 30) {
    cost += 5;
  } else if ((input.fps ?? 24) === 60) {
    cost += 15;
  }

  return cost;
}
