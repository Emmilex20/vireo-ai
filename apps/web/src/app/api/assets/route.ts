import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  db,
  deleteUserAsset,
  getUserAssets,
  updateAssetPublishStatus,
} from "@vireon/db";
import { inferMediaType } from "@/lib/media/infer-media-type";
import { deleteCloudinaryAsset } from "@/lib/storage/cloudinary";

type UserAsset = Awaited<ReturnType<typeof getUserAssets>>[number];

type AssetWithMediaType = {
  mediaType?: string | null;
  generationJob?: {
    type?: string | null;
    sourceImageUrl?: string | null;
    sourceAssetId?: string | null;
    storageProvider?: string | null;
    storagePublicId?: string | null;
  } | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = await getUserAssets(userId);

  const enrichedAssets = assets.map((assetRaw: UserAsset) => {
    const asset = assetRaw as typeof assetRaw & AssetWithMediaType;
    const generationJob = asset.generationJob;

    return {
      ...asset,
      mediaType: inferMediaType(asset),
      sourceImageUrl: generationJob?.sourceImageUrl ?? null,
      sourceAssetId: generationJob?.sourceAssetId ?? null
    };
  });

  return NextResponse.json({ assets: enrichedAssets });
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const assetRaw = await db.asset.findFirst({
      where: {
        id: assetId,
        userId,
      },
      include: {
        generationJob: true,
      },
    });

    const asset = assetRaw as (typeof assetRaw & AssetWithMediaType) | null;
    const generationJob = asset?.generationJob;

    if (
      asset &&
      generationJob?.storageProvider === "cloudinary" &&
      generationJob.storagePublicId
    ) {
      const result = await deleteCloudinaryAsset({
        publicId: generationJob.storagePublicId,
        resourceType: inferMediaType(asset),
      });

      if (!result.deleted) {
        console.warn("Cloudinary delete fallback:", result.reason);
      }
    }

    await deleteUserAsset({ userId, assetId });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (getErrorMessage(error) === "ASSET_NOT_FOUND") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const asset = await updateAssetPublishStatus({
      userId,
      assetId: body.assetId,
      isPublic: Boolean(body.isPublic),
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: unknown) {
    if (getErrorMessage(error) === "ASSET_NOT_FOUND") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update asset visibility" },
      { status: 500 }
    );
  }
}
