import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteVideoScene, updateVideoScene } from "@vireon/db";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sceneId } = await params;
    const body = (await req.json()) as {
      title?: string;
      prompt?: string;
    };

    if (body.prompt && body.prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Scene prompt must be at least 5 characters." },
        { status: 400 }
      );
    }

    const scene = await updateVideoScene({
      userId,
      sceneId,
      title: body.title,
      prompt: body.prompt
    });

    return NextResponse.json({ success: true, scene });
  } catch (error: unknown) {
    if (getErrorMessage(error) === "SCENE_NOT_FOUND") {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update scene" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sceneId } = await params;

    const project = await deleteVideoScene({
      userId,
      sceneId
    });

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    if (getErrorMessage(error) === "SCENE_NOT_FOUND") {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete scene" },
      { status: 500 }
    );
  }
}
