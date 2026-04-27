const BASE_IMAGE_COST = 5;
const DEFAULT_STEPS = 30;
const DEFAULT_GUIDANCE = 7.5;

type ImageQualityMode = "standard" | "high" | "ultra";

type ImageGenerationCostInput = {
  qualityMode?: ImageQualityMode;
  seed?: number | null;
  steps?: number;
  guidance?: number;
};

export function getImageGenerationCost(input: ImageGenerationCostInput) {
  let cost = BASE_IMAGE_COST;

  if (input.qualityMode === "ultra") {
    cost += 3;
  }

  if (input.seed != null) {
    cost += 1;
  }

  if ((input.steps ?? DEFAULT_STEPS) > DEFAULT_STEPS) {
    cost += (input.steps ?? DEFAULT_STEPS) > 40 ? 2 : 1;
  }

  if ((input.guidance ?? DEFAULT_GUIDANCE) > DEFAULT_GUIDANCE) {
    const guidance = input.guidance ?? DEFAULT_GUIDANCE;
    if (guidance > 15) {
      cost += 2;
    } else if (guidance > 10) {
      cost += 1;
    }
  }

  return cost;
}
