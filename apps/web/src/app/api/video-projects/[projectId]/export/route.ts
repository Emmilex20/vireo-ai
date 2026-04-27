import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createVideoProjectExportAttempt,
  deductCredits,
  getVideoProjectById,
  updateVideoProjectExport
} from "@vireon/db";
import { PROJECT_EXPORT_COSTS } from "@/lib/billing/project-export-costs";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { isWorkersMode } from "@/lib/runtime/background-mode";

type VideoProject = NonNullable<Awaited<ReturnType<typeof getVideoProjectById>>>;
type VideoProjectScene = VideoProject["scenes"][number];

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const workersMode = await isWorkersMode();

  if (!workersMode) {
    return NextResponse.json(
      {
        error:
          "Final project export is disabled in inline beta mode. Switch background mode to workers in admin when workers are available."
      },
      { status: 409 }
    );
  }

  const project = await getVideoProjectById({ userId, projectId });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const completedScenes = project.scenes.filter(
    (scene: VideoProjectScene) => scene.videoUrl
  );
  const exportAttemptId = `export_${projectId}_${Date.now()}`;

  if (completedScenes.length === 0) {
    return NextResponse.json(
      { error: "Generate at least one scene video before exporting." },
      { status: 400 }
    );
  }

  try {
    const [wallet] = await deductCredits({
      userId,
      amount: PROJECT_EXPORT_COSTS.combinedVideo,
      description: `Project video export: ${exportAttemptId}`,
      videoProjectId: projectId
    });

    await sendLowCreditsEmailIfNeeded({
      userId,
      balance: wallet.balance
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 400 }
      );
    }

    throw error;
  }

  await updateVideoProjectExport({
    userId,
    projectId,
    exportStatus: "queued",
    exportFailureReason: null,
    exportAttemptId
  });

  await createVideoProjectExportAttempt({
    userId,
    projectId,
    attemptId: exportAttemptId,
    creditsUsed: PROJECT_EXPORT_COSTS.combinedVideo
  });

  const { enqueueProjectExport } = await import(
    "@/lib/queue/project-export-queue"
  );
  await enqueueProjectExport(projectId, exportAttemptId);

  return NextResponse.json({
    success: true,
    message: "Export queued. Your final video will appear when stitching completes."
  });
}
