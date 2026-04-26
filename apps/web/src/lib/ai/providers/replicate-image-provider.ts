import Replicate from "replicate";
import type { ImageProvider } from "./types";

const MODEL =
  process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-schnell";

function mapAspectRatio(aspectRatio?: string) {
  const supported = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  if (aspectRatio && supported.includes(aspectRatio)) {
    return aspectRatio;
  }

  return "1:1";
}

function buildPrompt(input: {
  prompt: string;
  style?: string;
  qualityMode?: string;
  promptBoost?: boolean;
}) {
  const parts = [input.prompt.trim()];

  if (input.style) {
    parts.push(`${input.style} style`);
  }

  if (input.qualityMode === "high") {
    parts.push("high detail, premium cinematic quality");
  }

  if (input.promptBoost) {
    parts.push("professional lighting, clean composition, sharp focus");
  }

  return parts.join(", ");
}

function buildNegativePrompt(negativePrompt?: string) {
  const defaults = [
    "blurry",
    "low quality",
    "distorted",
    "bad anatomy",
    "watermark",
    "text artifacts"
  ];

  if (!negativePrompt?.trim()) {
    return defaults.join(", ");
  }

  return `${negativePrompt.trim()}, ${defaults.join(", ")}`;
}

export const replicateImageProvider: ImageProvider = {
  name: "replicate-image",

  async createImageJob(input) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.create({
      model: MODEL,
      input: {
        prompt: buildPrompt(input),
        negative_prompt: buildNegativePrompt(input.negativePrompt),
        num_outputs: 1,
        aspect_ratio: mapAspectRatio(input.aspectRatio),
        output_format: "webp",
        safety_tolerance: 2,
        seed: input.seed ?? undefined
      },
    });

    return {
      providerJobId: prediction.id,
      status: "processing",
    };
  },

  async getImageJobStatus(providerJobId) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(providerJobId);

    if (prediction.status === "succeeded") {
      const output = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      return {
        status: "completed",
        outputUrl: String(output),
      };
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return {
        status: "failed",
        error: prediction.error
          ? String(prediction.error)
          : "Replicate image generation failed",
      };
    }

    return { status: "processing" };
  },
};
