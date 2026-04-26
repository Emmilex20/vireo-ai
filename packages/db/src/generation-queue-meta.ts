import { db } from "./index";

export async function updateGenerationQueueMeta(params: {
  jobId: string;
  queueAttempts?: number;
  queueLastError?: string | null;
}) {
  return db.generationJob.update({
    where: { id: params.jobId },
    data: {
      lastCheckedAt: new Date(),
      queueAttempts: params.queueAttempts ?? undefined,
      queueLastError: params.queueLastError ?? undefined
    }
  });
}
