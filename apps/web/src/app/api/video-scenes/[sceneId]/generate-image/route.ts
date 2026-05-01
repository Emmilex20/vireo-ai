import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deductCredits, updateVideoSceneMedia } from "@vireon/db";
import { SCENE_GENERATION_COSTS } from "@/lib/billing/scene-costs";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { processVideoScene } from "@/lib/generation/process-video-scene";
import { isWorkersMode } from "@/lib/runtime/background-mode";

export const maxDuration = 300;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to queue scene image generation";
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sceneId } = await params;
    const workersMode = await isWorkersMode();

    const [wallet] = await deductCredits({
      userId,
      amount: SCENE_GENERATION_COSTS.image,
      description: "Scene image generation",
      sceneId
    });

    await sendLowCreditsEmailIfNeeded({
      userId,
      balance: wallet.balance
    });

    await updateVideoSceneMedia({
      userId,
      sceneId,
      status: workersMode ? "queued_image" : "generating_image",
      failureReason: null
    });

    if (workersMode) {
      const { enqueueSceneGeneration } = await import(
        "@/lib/queue/scene-queue"
      );
      await enqueueSceneGeneration({
        sceneId,
        kind: "image"
      });
    } else {
      await processVideoScene({
        userId,
        sceneId,
        kind: "image"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "SCENE_NOT_FOUND") {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
