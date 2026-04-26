import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminUnpublishAsset, getAdminPublicAssets } from "@vireon/db";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export async function GET() {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assets = await getAdminPublicAssets();

  return NextResponse.json({
    assets: assets.map((asset) => ({
      ...asset,
      mediaType: asset.mediaType === "video" ? "video" : "image",
      creator: asset.user,
    })),
  });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.assetId) {
    return NextResponse.json(
      { error: "Asset ID is required" },
      { status: 400 }
    );
  }

  const asset = await adminUnpublishAsset({
    assetId: body.assetId,
    adminId: userId,
    note: body.note,
  });

  return NextResponse.json({ success: true, asset });
}
