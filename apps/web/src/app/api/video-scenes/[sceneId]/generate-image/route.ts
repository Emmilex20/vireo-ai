import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deductCredits, updateVideoSceneMedia } from "@vireon/db";
import { SCENE_GENERATION_COSTS } from "@/lib/billing/scene-costs";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { enqueueSceneGeneration } from "@/lib/queue/scene-queue";

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
      status: "queued_image",
      failureReason: null
    });

    await enqueueSceneGeneration({
      sceneId,
      kind: "image"
    });

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
