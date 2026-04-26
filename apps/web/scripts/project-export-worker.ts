import path from "node:path";
import { config as loadEnv } from "dotenv";
import { logError } from "../src/lib/monitoring/logger";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const [{ Worker }, dbModule, { queueConnection }, { processProjectExport }] =
    await Promise.all([
      import("bullmq"),
      import("@vireon/db"),
      import("../src/lib/queue/redis"),
      import("../src/lib/generation/process-project-export")
    ]);

  const { db } = dbModule;

  const worker = new Worker(
    "project-export",
    async (job) => {
      const { projectId, exportAttemptId } = job.data as {
        projectId: string;
        exportAttemptId: string;
      };

      return processProjectExport(projectId, exportAttemptId);
    },
    {
      connection: queueConnection,
      concurrency: Number(process.env.PROJECT_EXPORT_WORKER_CONCURRENCY ?? 1)
    }
  );

  worker.on("completed", (job) => {
    console.log(`[project-export-worker] Completed export job: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    logError(error, {
      queueJobId: job?.id,
      queue: "project-export"
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
    queue: "project-export",
    worker: "project-export-worker"
  });
  process.exit(1);
});
