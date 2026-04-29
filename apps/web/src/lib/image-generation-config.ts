const BASE_IMAGE_COST = 5;
const DEFAULT_STEPS = 30;
const DEFAULT_GUIDANCE = 7.5;
const IMAGE_MODEL_SURCHARGES: Record<string, number> = {
  "black-forest-labs/flux-schnell": 0,
  "google/imagen-4-ultra": 10,
  "bytedance/seedream-4.5": 8,
  "ideogram-ai/ideogram-v3-quality": 6,
};

type ImageQualityMode = "standard" | "high" | "ultra";

type ImageGenerationCostInput = {
  modelId?: string | null;
  qualityMode?: ImageQualityMode;
  seed?: number | null;
  steps?: number;
  guidance?: number;
};

export function getImageGenerationCost(input: ImageGenerationCostInput) {
  let cost = BASE_IMAGE_COST;
  cost += IMAGE_MODEL_SURCHARGES[input.modelId ?? ""] ?? 0;

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
