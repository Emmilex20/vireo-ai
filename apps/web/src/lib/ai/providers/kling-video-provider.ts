import { createHmac } from "node:crypto";
import type { VideoGenerationInput, VideoProvider } from "./types";

type KlingStatus = "processing" | "completed" | "failed";

class KlingApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "KlingApiError";
    this.status = status;
  }
}

function base64Url(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createKlingToken() {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error("KLING_ACCESS_KEY or KLING_SECRET_KEY is not set");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: accessKey,
      exp: now + 30 * 60,
      nbf: now - 5,
    })
  );
  const signature = base64Url(
    createHmac("sha256", secretKey).update(`${header}.${payload}`).digest()
  );

  return `${header}.${payload}.${signature}`;
}

function getKlingBaseUrl() {
  return (process.env.KLING_API_BASE_URL || "https://api.klingapi.com").replace(
    /\/$/,
    ""
  );
}

function resolveKlingVideoModel(modelId?: string | null) {
  if (process.env.KLING_VIDEO_MODEL) {
    return process.env.KLING_VIDEO_MODEL;
  }

  if (modelId?.includes("kling-o1")) return "kling-video-o1";
  if (modelId?.includes("kling-v2.5")) return "kling-v2.5-turbo";
  if (modelId?.includes("kling-v2.6")) return "kling-v2.6-pro";

  return "kling-v2.6-pro";
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNestedString(value: unknown, keys: string[]): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  let current: unknown = value;

  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return readString(current);
}

function readTaskId(response: unknown) {
  return (
    readNestedString(response, ["task_id"]) ||
    readNestedString(response, ["id"]) ||
    readNestedString(response, ["data", "task_id"]) ||
    readNestedString(response, ["data", "id"])
  );
}

function readOutputUrl(response: unknown) {
  const direct =
    readNestedString(response, ["outputUrl"]) ||
    readNestedString(response, ["output_url"]) ||
    readNestedString(response, ["video_url"]) ||
    readNestedString(response, ["url"]) ||
    readNestedString(response, ["output", "video_url"]) ||
    readNestedString(response, ["data", "output", "video_url"]) ||
    readNestedString(response, ["task_result", "videos", "0", "url"]) ||
    readNestedString(response, ["data", "task_result", "videos", "0", "url"]);

  if (direct) return direct;

  const videos =
    readNestedArray(response, ["task_result", "videos"]) ||
    readNestedArray(response, ["data", "task_result", "videos"]) ||
    readNestedArray(response, ["data", "data", "task_result", "videos"]);

  const firstVideo = videos?.[0];

  if (typeof firstVideo === "string") return firstVideo;
  if (firstVideo && typeof firstVideo === "object") {
    return readString((firstVideo as Record<string, unknown>).url);
  }

  return undefined;
}

function readNestedArray(value: unknown, keys: string[]): unknown[] | undefined {
  if (!value || typeof value !== "object") return undefined;

  let current: unknown = value;

  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return Array.isArray(current) ? current : undefined;
}

function readStatus(response: unknown): KlingStatus {
  const raw =
    readNestedString(response, ["status"]) ||
    readNestedString(response, ["task_status"]) ||
    readNestedString(response, ["data", "status"]) ||
    readNestedString(response, ["data", "task_status"]) ||
    readNestedString(response, ["data", "data", "task_status"]);
  const normalized = raw?.toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "succeeded" ||
    normalized === "succeed" ||
    normalized === "success"
  ) {
    return "completed";
  }

  if (
    normalized === "failed" ||
    normalized === "fail" ||
    normalized === "error" ||
    normalized === "canceled" ||
    normalized === "cancelled"
  ) {
    return "failed";
  }

  return "processing";
}

function readError(response: unknown) {
  return (
    readNestedString(response, ["error"]) ||
    readNestedString(response, ["message"]) ||
    readNestedString(response, ["data", "error"]) ||
    readNestedString(response, ["data", "message"]) ||
    "Kling video generation failed"
  );
}

async function requestKling(path: string, init?: RequestInit) {
  const response = await fetch(`${getKlingBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${createKlingToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const text = await response.text();
  let body: unknown = {};

  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text || "Kling returned an invalid response" };
  }

  if (!response.ok) {
    throw new KlingApiError(readError(body), response.status);
  }

  return body;
}

function buildKlingPayload(input: VideoGenerationInput) {
  return {
    model: resolveKlingVideoModel(input.modelId),
    prompt: input.prompt.trim(),
    negative_prompt: input.negativePrompt || undefined,
    duration: input.duration ?? 5,
    aspect_ratio: input.aspectRatio ?? "16:9",
    mode: process.env.KLING_VIDEO_MODE || "professional",
    image: input.imageUrl || undefined,
  };
}

export const klingVideoProvider: VideoProvider = {
  name: "kling-video",

  async createVideoJob(input) {
    const payload = buildKlingPayload(input);
    const endpoint = input.imageUrl
      ? "/v1/videos/image2video"
      : "/v1/videos/text2video";

    const response = await requestKling(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const taskId = readTaskId(response);

    if (!taskId) {
      throw new KlingApiError("Kling did not return a task id");
    }

    return {
      providerJobId: taskId,
      status: "processing",
    };
  },

  async getVideoJobStatus(providerJobId) {
    const response = await requestKling(`/v1/videos/${providerJobId}`);
    const status = readStatus(response);
    const outputUrl = readOutputUrl(response);

    if (status === "completed") {
      return outputUrl
        ? { status: "completed", outputUrl }
        : { status: "processing" };
    }

    if (status === "failed") {
      return {
        status: "failed",
        error: readError(response),
      };
    }

    return { status: "processing" };
  },
};
