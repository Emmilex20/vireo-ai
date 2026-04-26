import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createVideoScene } from "@vireon/db";

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
    const body = await req.json();

    if (!body.prompt || body.prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Scene prompt must be at least 5 characters." },
        { status: 400 }
      );
    }

    const scene = await createVideoScene({
      userId,
      projectId,
      title: body.title,
      prompt: body.prompt
    });

    return NextResponse.json({ success: true, scene });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create scene" },
      { status: 500 }
    );
  }
}
