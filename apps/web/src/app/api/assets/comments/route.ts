import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAssetComment, getAssetComments } from "@vireon/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const assetId = searchParams.get("assetId")

  if (!assetId) {
    return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
  }

  const comments = await getAssetComments(assetId)

  return NextResponse.json({ comments })
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    if (!body.assetId) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    const comment = await createAssetComment({
      userId,
      assetId: body.assetId,
      body: body.body ?? "",
    })

    return NextResponse.json({ success: true, comment })
  } catch (error: any) {
    if (error.message === "COMMENT_TOO_SHORT") {
      return NextResponse.json(
        { error: "Comment must be at least 2 characters." },
        { status: 400 }
      )
    }

    if (error.message === "ASSET_NOT_FOUND") {
      return NextResponse.json({ error: "Public asset not found." }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to create comment." }, { status: 500 })
  }
}
