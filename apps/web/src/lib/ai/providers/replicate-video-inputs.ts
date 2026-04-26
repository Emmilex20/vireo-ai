import type { VideoGenerationInput } from "./types";

export function buildReplicateVideoInput(input: VideoGenerationInput) {
  const model = process.env.REPLICATE_VIDEO_MODEL || "";

  const prompt = [
    input.prompt.trim(),
    input.shotType,
    input.cameraMove ? `camera movement: ${input.cameraMove}` : null,
    input.motionIntensity ? `motion intensity: ${input.motionIntensity}` : null,
    input.styleStrength ? `style strength: ${input.styleStrength}` : null
  ]
    .filter(Boolean)
    .join(", ");

  if (model.includes("minimax") || model.includes("video-01")) {
    return {
      prompt,
      prompt_optimizer: true
    };
  }

  if (model.includes("prunaai/p-video") || model.includes("p-video")) {
    return {
      prompt,
      image: input.imageUrl || undefined,
      duration: input.duration ?? 5,
      aspect_ratio: input.aspectRatio ?? "16:9",
      negative_prompt: input.negativePrompt || undefined,
      fps: input.fps ?? 24,
      prompt_upsampling: true
    };
  }

  if (model.includes("wan") || model.includes("i2v")) {
    return {
      prompt,
      negative_prompt: input.negativePrompt || undefined,
      image: input.imageUrl || undefined
    };
  }

  if (model.includes("stable-video")) {
    return {
      input_image: input.imageUrl || undefined,
      video_length: input.duration ?? 5,
      sizing_strategy: "maintain_aspect_ratio",
      motion_bucket_id: mapMotionBucket(input.motionIntensity)
    };
  }

  return {
    prompt,
    duration: input.duration ?? 5,
    aspect_ratio: input.aspectRatio ?? "16:9",
    negative_prompt: input.negativePrompt || undefined
  };
}

function mapMotionBucket(motionIntensity?: string) {
  if (motionIntensity === "low") return 80;
  if (motionIntensity === "high") return 180;
  return 127;
}
