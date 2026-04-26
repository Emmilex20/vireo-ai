import { Queue } from "bullmq";
import { queueConnection } from "./redis";

export const generationQueue = new Queue("generation", {
  connection: queueConnection
});

export async function enqueueGenerationJob(
  jobId: string,
  options?: { delayMs?: number }
) {
  return generationQueue.add(
    "process-generation",
    { jobId },
    {
      delay: options?.delayMs ?? 0,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000
      },
      removeOnComplete: 100,
      removeOnFail: 100
    }
  );
}

export async function enqueueGenerationStatusCheck(
  jobId: string,
  delayMs = 10000
) {
  return generationQueue.add(
    "process-generation",
    { jobId },
    {
      delay: delayMs,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000
      },
      removeOnComplete: 100,
      removeOnFail: 100
    }
  );
}
