import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getPublicAssets } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()
  const assets = await getPublicAssets(userId ?? undefined)

  return NextResponse.json({
    assets: assets.map((asset) => ({
      ...asset,
      mediaType: asset.mediaType === "video" ? "video" : "image",
      sourceImageUrl: asset.generationJob?.sourceImageUrl ?? null,
      likedByMe: Boolean(asset.likes?.length),
      savedByMe: Boolean(asset.saves?.length),
      creator: asset.user,
    })),
  })
}
