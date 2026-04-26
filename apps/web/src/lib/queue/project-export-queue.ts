import { Queue } from "bullmq";
import { queueConnection } from "./redis";

export const projectExportQueue = new Queue("project-export", {
  connection: queueConnection
});

export async function enqueueProjectExport(
  projectId: string,
  exportAttemptId: string
) {
  return projectExportQueue.add(
    "export-project",
    { projectId, exportAttemptId },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 10000
      },
      removeOnComplete: 50,
      removeOnFail: 50
    }
  );
}
