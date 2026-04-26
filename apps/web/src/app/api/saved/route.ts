import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSavedAssets } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const saved = await getSavedAssets(userId)

  return NextResponse.json({
    assets: saved.map((item) => ({
      ...item.asset,
      mediaType: item.asset.mediaType === "video" ? "video" : "image",
      sourceImageUrl: item.asset.generationJob?.sourceImageUrl ?? null,
      likedByMe: Boolean(item.asset.likes?.length),
      savedByMe: Boolean(item.asset.saves?.length),
    })),
  })
}
