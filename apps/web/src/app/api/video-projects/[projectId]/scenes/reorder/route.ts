import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { reorderVideoScenes } from "@vireon/db";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = (await req.json()) as {
      sceneIds?: string[];
    };

    if (!Array.isArray(body.sceneIds)) {
      return NextResponse.json(
        { error: "sceneIds must be an array" },
        { status: 400 }
      );
    }

    const project = await reorderVideoScenes({
      userId,
      projectId,
      sceneIds: body.sceneIds
    });

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    if (getErrorMessage(error) === "PROJECT_NOT_FOUND") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (getErrorMessage(error) === "INVALID_SCENE_ORDER") {
      return NextResponse.json(
        { error: "Invalid scene order" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to reorder scenes" },
      { status: 500 }
    );
  }
}
