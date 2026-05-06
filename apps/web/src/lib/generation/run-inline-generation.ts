import {
  completeAudioJob,
  completeImageJob,
  completeVideoJob,
  failAudioJob,
  failImageJob,
  failVideoJob
} from "@vireon/db";
import { sendGenerationFailedEmailNotification } from "@/lib/email/notifications";
import {
  processGenerationJob,
  type ProcessableGenerationJob
} from "@/lib/generation/process-generation-job";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const INLINE_GENERATION_TIMEOUT_MS = 5 * 60 * 1000;
const INLINE_IMAGE_POLL_INTERVAL_MS = 3000;
const INLINE_VIDEO_POLL_INTERVAL_MS = 5000;
const INLINE_AUDIO_POLL_INTERVAL_MS = 3000;

export async function runGenerationJobInline(
  job: ProcessableGenerationJob
): Promise<InlineGenerationJobResult> {
  let currentJob = job;
  const pollIntervalMs =
    currentJob.type === "video"
      ? INLINE_VIDEO_POLL_INTERVAL_MS
      : currentJob.type === "audio"
        ? INLINE_AUDIO_POLL_INTERVAL_MS
      : INLINE_IMAGE_POLL_INTERVAL_MS;
  const deadline = Date.now() + INLINE_GENERATION_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const result = await processGenerationJob(currentJob);

    if (result.status !== "processing") {
      return result.job as InlineGenerationJobResult;
    }

    currentJob = result.job as ProcessableGenerationJob;
    const remainingMs = deadline - Date.now();

    if (remainingMs > 0) {
      await sleep(Math.min(pollIntervalMs, remainingMs));
    }
  }

  const failedJob =
    currentJob.type === "video"
      ? await failVideoJob(
          currentJob.id,
          "Video generation timed out while running without workers."
        )
      : currentJob.type === "audio"
        ? await failAudioJob(
            currentJob.id,
            "Audio generation timed out while running without workers."
          )
      : await failImageJob(
          currentJob.id,
          "Image generation timed out while running without workers."
        );

  await sendGenerationFailedEmailNotification(currentJob.userId);

  return failedJob;
}

export type InlineGenerationJobResult =
  | Awaited<ReturnType<typeof completeAudioJob>>
  | Awaited<ReturnType<typeof completeImageJob>>
  | Awaited<ReturnType<typeof completeVideoJob>>
  | Awaited<ReturnType<typeof failAudioJob>>
  | Awaited<ReturnType<typeof failImageJob>>
  | Awaited<ReturnType<typeof failVideoJob>>;
