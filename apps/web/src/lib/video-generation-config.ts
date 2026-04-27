export const VIDEO_DURATION_OPTIONS = [5, 10, 15, 20] as const;

const BASE_VIDEO_COST = 40;
const BASE_VIDEO_DURATION = 5;
const DEFAULT_MOTION_GUIDANCE = 6;

type VideoGenerationCostInput = {
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
