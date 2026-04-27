export const VIDEO_DURATION_OPTIONS = [5, 10, 15, 20] as const;

const BASE_VIDEO_COST = 40;
const BASE_VIDEO_DURATION = 5;

export function isSupportedVideoDuration(value: number) {
  return VIDEO_DURATION_OPTIONS.includes(
    value as (typeof VIDEO_DURATION_OPTIONS)[number]
  );
}

export function getVideoGenerationCost(duration: number) {
  const normalizedDuration = isSupportedVideoDuration(duration)
    ? duration
    : BASE_VIDEO_DURATION;

  return (normalizedDuration / BASE_VIDEO_DURATION) * BASE_VIDEO_COST;
}
