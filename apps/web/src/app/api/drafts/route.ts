import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createPromptDraft,
  deletePromptDraft,
  getUserPromptDrafts,
} from "@vireon/db";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type");
  const type =
    typeParam === "image" || typeParam === "video" ? typeParam : undefined;

  const drafts = await getUserPromptDrafts(userId, type);

  return NextResponse.json({ drafts });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const draft = await createPromptDraft({
      userId,
      modelId: body.modelId,
      type: body.type ?? "image",
      title: body.title,
      prompt: body.prompt,
      negativePrompt: body.negativePrompt,

      style: body.style,
      aspectRatio: body.aspectRatio,
      qualityMode: body.qualityMode,
      promptBoost: body.promptBoost,
      seed: body.seed,
      steps: body.steps,
      guidance: body.guidance,

      duration: body.duration,
      motionIntensity: body.motionIntensity,
      cameraMove: body.cameraMove,
      styleStrength: body.styleStrength,
      motionGuidance: body.motionGuidance,
      shotType: body.shotType,
      fps: body.fps,
    });

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "DRAFT_TITLE_REQUIRED") {
      return NextResponse.json(
        { error: "Draft title is required" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "DRAFT_PROMPT_TOO_SHORT") {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("draftId");

    if (!draftId) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    await deletePromptDraft({
      userId,
      draftId,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "DRAFT_NOT_FOUND") {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
