import Replicate from "replicate";
import {
  resolveReplicateAudioModel,
  type ReplicateAudioModelId,
} from "./replicate-audio-models";
import { normalizeReplicateInputForModel } from "./replicate-schema";
import type { AudioProvider } from "./types";

const FALLBACK_MODEL: ReplicateAudioModelId = "elevenlabs/v2-multilingual";

type ReplicatePredictionInput = {
  model?: string;
  modelId?: string;
};

function getPredictionModelId(prediction: ReplicatePredictionInput) {
  return (
    (prediction.modelId as ReplicateAudioModelId | undefined) ??
    (prediction.model as ReplicateAudioModelId | undefined) ??
    FALLBACK_MODEL
  );
}

function extractAudioUrl(output: unknown): string | undefined {
  if (!output) return undefined;
  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractAudioUrl(item);
      if (url) return url;
    }
    return undefined;
  }

  if (typeof output === "object") {
    const record = output as Record<string, unknown>;
    const candidates = [
      "audio",
      "audio_url",
      "output",
      "url",
      "file",
      "media",
      "mp3",
      "wav",
    ];

    for (const key of candidates) {
      const url = extractAudioUrl(record[key]);
      if (url) return url;
    }
  }

  return undefined;
}

export const replicateAudioProvider: AudioProvider = {
  name: "replicate-audio",

  async createAudioJob(input) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const model = resolveReplicateAudioModel(input.modelId);
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const predictionInput = await normalizeReplicateInputForModel(
      model.id,
      model.buildInput(input)
    );

    const prediction = await replicate.predictions.create({
      model: model.id,
      input: predictionInput,
    });

    return {
      providerJobId: prediction.id,
      status: "processing",
    };
  },

  async getAudioJobStatus(providerJobId) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(providerJobId);
    const model = resolveReplicateAudioModel(getPredictionModelId(prediction));

    if (prediction.status === "succeeded") {
      const outputUrl = extractAudioUrl(prediction.output);

      return outputUrl
        ? {
            status: "completed",
            outputUrl,
          }
        : {
            status: "failed",
            error: `${model.label} completed without an audio URL`,
          };
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return {
        status: "failed",
        error: prediction.error
          ? String(prediction.error)
          : `${model.label} audio generation failed`,
      };
    }

    return { status: "processing" };
  },
};
