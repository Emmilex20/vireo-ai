import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGenerationJobById } from "@vireon/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;

  const job = await getGenerationJobById(jobId, userId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    type: job.type,
    status: job.status,
    outputUrl: job.outputUrl,
    failureReason: job.failureReason,
    refundedAt: job.refundedAt,
    providerName: job.providerName,
    providerJobId: job.providerJobId,
    storageProvider: job.storageProvider,
    storageStatus: job.storageStatus,
    storageReason: job.storageReason,
    storagePublicId: job.storagePublicId,
    prompt: job.prompt,
    modelId: job.modelId,
    creditsUsed: job.creditsUsed,
    settings: job.settings,
    createdAt: job.createdAt
  });
}
