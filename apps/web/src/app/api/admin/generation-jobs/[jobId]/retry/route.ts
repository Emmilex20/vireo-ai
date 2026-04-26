import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@vireon/db";
import { processGenerationJob } from "@/lib/generation/process-generation-job";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { jobId } = await params;

  const job = await db.generationJob.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "processing") {
    return NextResponse.json(
      { error: "Only processing jobs can be retried" },
      { status: 400 }
    );
  }

  const result = await processGenerationJob(job);

  return NextResponse.json({
    success: true,
    job: result.job
  });
}
