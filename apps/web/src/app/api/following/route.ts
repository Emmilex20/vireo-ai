import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getFollowingFeed } from "@vireon/db"

type FollowingAsset = Awaited<ReturnType<typeof getFollowingFeed>>[number];

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const assets = await getFollowingFeed(userId)

  return NextResponse.json({
    assets: assets.map((asset: FollowingAsset) => ({
      ...asset,
      mediaType: asset.mediaType === "video" ? "video" : "image",
      sourceImageUrl: asset.generationJob?.sourceImageUrl ?? null,
      likedByMe: Boolean(asset.likes?.length),
      savedByMe: Boolean(asset.saves?.length),
      creator: asset.user,
    })),
  })
}
