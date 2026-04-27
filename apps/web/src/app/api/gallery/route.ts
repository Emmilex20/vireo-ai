import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getPublicAssets } from "@vireon/db"

type PublicAsset = Awaited<ReturnType<typeof getPublicAssets>>[number];

export async function GET() {
  const { userId } = await auth()
  const assets = await getPublicAssets(userId ?? undefined)

  return NextResponse.json({
    assets: assets.map((asset: PublicAsset) => ({
      ...asset,
      mediaType: asset.mediaType === "video" ? "video" : "image",
      sourceImageUrl: asset.generationJob?.sourceImageUrl ?? null,
      likedByMe: Boolean(asset.likes?.length),
      savedByMe: Boolean(asset.saves?.length),
      creator: asset.user,
    })),
  })
}
