import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { publishVideoProjectExportAsAsset } from "@vireon/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const asset = await publishVideoProjectExportAsAsset({
      userId,
      projectId
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "EXPORT_NOT_FOUND") {
      return NextResponse.json(
        { error: "No completed export found for this project." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to publish export." },
      { status: 500 }
    );
  }
}
