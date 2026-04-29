import Replicate from "replicate";
import {
  resolveReplicateImageModel,
  type ReplicateImageModelId,
} from "./replicate-image-models";
import type { ImageProvider } from "./types";

const FALLBACK_MODEL = "black-forest-labs/flux-schnell";

type ReplicatePredictionInput = {
  model?: string;
  modelId?: string;
};

function getPredictionModelId(prediction: ReplicatePredictionInput) {
  return (
    (prediction.modelId as ReplicateImageModelId | undefined) ??
    (prediction.model as ReplicateImageModelId | undefined) ??
    FALLBACK_MODEL
  );
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

    const model = resolveReplicateImageModel(input.modelId);

    const prediction = await replicate.predictions.create({
      model: model.id,
      input: model.buildInput(input),
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
    const model = resolveReplicateImageModel(getPredictionModelId(prediction));

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
          : `${model.label} image generation failed`,
      };
    }

    return { status: "processing" };
  },
};
