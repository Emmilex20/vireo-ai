import Replicate from "replicate";
import type { VideoProvider } from "./types";
import { resolveReplicateVideoModel } from "./replicate-video-models";
import { normalizeReplicateInputForModel } from "./replicate-schema";

export const replicateVideoProvider: VideoProvider = {
  name: "replicate-video",

  async createVideoJob(input) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const selectedModel = resolveReplicateVideoModel(input.modelId);
    const model = selectedModel.id;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    const rawInput = selectedModel.buildInput(input);
    const predictionInput = await normalizeReplicateInputForModel(model, rawInput);

    const prediction = await replicate.predictions.create({
      model,
      input: predictionInput
    });

    return {
      providerJobId: prediction.id,
      status: "processing"
    };
  },

  async getVideoJobStatus(providerJobId) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    const prediction = await replicate.predictions.get(providerJobId);

    if (prediction.status === "succeeded") {
      const output = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      return {
        status: "completed",
        outputUrl: String(output)
      };
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return {
        status: "failed",
        error: prediction.error
          ? String(prediction.error)
          : "Replicate video generation failed"
      };
    }

    return { status: "processing" };
  }
};
