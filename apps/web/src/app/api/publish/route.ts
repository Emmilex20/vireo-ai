import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { publishAsset } from "@vireon/db"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const assetId = typeof body.assetId === "string" ? body.assetId : undefined
    const caption = typeof body.caption === "string" ? body.caption : undefined

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      )
    }

    const post = await publishAsset({
      userId,
      assetId,
      caption,
    })

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "ASSET_NOT_FOUND") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    return NextResponse.json(
      { error: "Failed to publish asset" },
      { status: 500 }
    )
  }
}
