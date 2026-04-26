import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSourceAssetForGeneration } from "@vireon/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;

  const asset = await getSourceAssetForGeneration({
    userId,
    sourceAssetId: assetId
  });

  if (!asset) {
    return NextResponse.json(
      { error: "Source asset not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ asset });
}
