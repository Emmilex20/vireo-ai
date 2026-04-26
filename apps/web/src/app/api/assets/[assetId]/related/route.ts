import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRelatedGenerationsForAsset } from "@vireon/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  const generations = await getRelatedGenerationsForAsset(assetId, userId);

  return NextResponse.json({ generations });
}
