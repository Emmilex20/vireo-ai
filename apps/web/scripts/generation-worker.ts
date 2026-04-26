import path from "node:path";
import { config as loadEnv } from "dotenv";
import { sendGenerationFailedEmailNotification } from "../src/lib/email/notifications";
import { logError } from "../src/lib/monitoring/logger";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const [
    { Worker },
    dbModule,
    { processGenerationJob },
    { isGenerationTimedOut },
    { queueConnection },
    { enqueueGenerationStatusCheck }
  ] =
    await Promise.all([
      import("bullmq"),
      import("@vireon/db"),
      import("../src/lib/generation/process-generation-job"),
      import("../src/lib/generation/generation-timeout"),
      import("../src/lib/queue/redis"),
      import("../src/lib/queue/generation-queue")
    ]);

  const {
    db,
    failImageJob,
    failVideoJob,
    updateGenerationQueueMeta
  } = dbModule;
  const retryDelayMs = Number(process.env.WORKER_RETRY_DELAY_MS ?? 10000);

  const worker = new Worker(
    "generation",
    async (job) => {
      const generationJobId = job.data.jobId as string;

      const generationJob = await db.generationJob.findUnique({
        where: { id: generationJobId }
      });

      if (!generationJob) {
        throw new Error("Generation job not found");
      }

      if (generationJob.status !== "processing") {
        return generationJob;
      }

      await updateGenerationQueueMeta({
        jobId: generationJob.id,
        queueAttempts: job.attemptsMade + 1,
        queueLastError: null
      });

      if (isGenerationTimedOut({ createdAt: generationJob.createdAt })) {
        if (generationJob.type === "image") {
          const failedJob = await failImageJob(
            generationJob.id,
            "Image generation timed out after waiting too long."
          );
          await sendGenerationFailedEmailNotification(generationJob.userId);
          return failedJob;
        }

        if (generationJob.type === "video") {
          const failedJob = await failVideoJob(
            generationJob.id,
            "Video generation timed out after waiting too long."
          );
          await sendGenerationFailedEmailNotification(generationJob.userId);
          return failedJob;
        }
      }

      const result = await processGenerationJob(generationJob);

      if (result.status === "processing") {
        await enqueueGenerationStatusCheck(generationJob.id, retryDelayMs);
      }

      return result.job;
    },
    {
      connection: queueConnection,
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 3)
    }
  );

  worker.on("completed", (job) => {
    console.log(`[worker] Queue job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    const generationJobId = job?.data?.jobId;

    if (generationJobId) {
      void updateGenerationQueueMeta({
        jobId: generationJobId,
        queueLastError: error.message
      });
    }

    logError(error, {
      queueJobId: job?.id,
      queue: "generation",
      generationJobId
    });
  });

  const shutdown = async () => {
    await worker.close();
    await queueConnection.quit();
    await db.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => {
    void shutdown();
  });

  process.on("SIGINT", () => {
    void shutdown();
  });
}

main().catch((error) => {
  logError(error, {
    queue: "generation",
    worker: "generation-worker"
  });
  process.exit(1);
});
