import path from "node:path";
import { config as loadEnv } from "dotenv";
import { logError } from "../src/lib/monitoring/logger";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const [{ Worker }, dbModule, { processVideoScene }, { queueConnection }] =
    await Promise.all([
      import("bullmq"),
      import("@vireon/db"),
      import("../src/lib/generation/process-video-scene"),
      import("../src/lib/queue/redis")
    ]);

  const { db } = dbModule;

  const worker = new Worker(
    "scene-generation",
    async (job) => {
      const { sceneId, kind } = job.data as {
        sceneId: string;
        kind: "image" | "video";
      };

      const scene = await db.videoScene.findUnique({
        where: { id: sceneId },
        include: {
          project: true
        }
      });

      if (!scene) {
        throw new Error("Scene not found");
      }

      return processVideoScene({
        userId: scene.project.userId,
        sceneId,
        kind
      });
    },
    {
      connection: queueConnection,
      concurrency: Number(process.env.SCENE_WORKER_CONCURRENCY ?? 2)
    }
  );

  worker.on("completed", (job) => {
    console.log(`[scene-worker] Completed queue job: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    logError(error, {
      queueJobId: job?.id,
      queue: "scene-generation"
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
    queue: "scene-generation",
    worker: "scene-worker"
  });
  process.exit(1);
});
