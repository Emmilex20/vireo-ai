import { db } from "./index";

export async function markGenerationFailover(params: {
  jobId: string;
  fallbackProviderName: string;
  fallbackProviderJobId: string;
  reason: string;
}) {
  return db.generationJob.update({
    where: { id: params.jobId },
    data: {
      providerName: params.fallbackProviderName,
      providerJobId: params.fallbackProviderJobId,
      fallbackProviderName: params.fallbackProviderName,
      failoverReason: params.reason,
      failoverAt: new Date(),
      queueLastError: null
    }
  });
}
