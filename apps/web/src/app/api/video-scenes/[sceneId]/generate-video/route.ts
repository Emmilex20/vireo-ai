import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  deductCredits,
  getVideoSceneForUser,
  updateVideoSceneMedia
} from "@vireon/db";
import { SCENE_GENERATION_COSTS } from "@/lib/billing/scene-costs";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { enqueueSceneGeneration } from "@/lib/queue/scene-queue";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to queue scene video generation";
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

    const scene = await getVideoSceneForUser({ userId, sceneId });

    if (!scene) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    if (!scene.imageUrl) {
      return NextResponse.json(
        { error: "Generate a scene image first." },
        { status: 400 }
      );
    }

    const [wallet] = await deductCredits({
      userId,
      amount: SCENE_GENERATION_COSTS.video,
      description: "Scene video generation",
      sceneId
    });

    await sendLowCreditsEmailIfNeeded({
      userId,
      balance: wallet.balance
    });

    await updateVideoSceneMedia({
      userId,
      sceneId,
      status: "queued_video",
      failureReason: null
    });

    await enqueueSceneGeneration({
      sceneId,
      kind: "video"
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
