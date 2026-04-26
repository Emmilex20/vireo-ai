import { Queue } from "bullmq";
import { queueConnection } from "./redis";

export const sceneQueue = new Queue("scene-generation", {
  connection: queueConnection
});

export async function enqueueSceneGeneration(params: {
  sceneId: string;
  kind: "image" | "video";
}) {
  return sceneQueue.add("process-scene", params, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  });
}
