import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getPublicAssets } from "@vireon/db"
import { inferMediaType } from "@/lib/media/infer-media-type"

type PublicAsset = Awaited<ReturnType<typeof getPublicAssets>>[number];

export async function GET() {
  const { userId } = await auth()
  const assets = await getPublicAssets(userId ?? undefined)

  return NextResponse.json({
    assets: assets.map((asset: PublicAsset) => ({
      ...asset,
      mediaType: inferMediaType(asset),
      sourceImageUrl: asset.generationJob?.sourceImageUrl ?? null,
      likedByMe: Boolean(asset.likes?.length),
      savedByMe: Boolean(asset.saves?.length),
      creator: asset.user,
    })),
  })
}
