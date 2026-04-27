import {
  completeImageJob,
  completeVideoJob,
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

export async function runGenerationJobInline(
  job: ProcessableGenerationJob
): Promise<InlineGenerationJobResult> {
  let currentJob = job;
  const attempts = currentJob.type === "video" ? 60 : 30;
  const delayMs = currentJob.type === "video" ? 5000 : 3000;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const result = await processGenerationJob(currentJob);

    if (result.status !== "processing") {
      return result.job as InlineGenerationJobResult;
    }

    currentJob = result.job as ProcessableGenerationJob;
    await sleep(delayMs);
  }

  const failedJob =
    currentJob.type === "video"
      ? await failVideoJob(
          currentJob.id,
          "Video generation timed out while running without workers."
        )
      : await failImageJob(
          currentJob.id,
          "Image generation timed out while running without workers."
        );

  await sendGenerationFailedEmailNotification(currentJob.userId);

  return failedJob;
}

export type InlineGenerationJobResult =
  | Awaited<ReturnType<typeof completeImageJob>>
  | Awaited<ReturnType<typeof completeVideoJob>>
  | Awaited<ReturnType<typeof failImageJob>>
  | Awaited<ReturnType<typeof failVideoJob>>;
