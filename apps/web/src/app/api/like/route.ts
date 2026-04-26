import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { toggleLike } from "@vireon/db"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const postId = typeof body.postId === "string" ? body.postId : undefined

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      )
    }

    const result = await toggleLike({
      userId,
      postId,
    })

    return NextResponse.json({
      success: true,
      liked: result.liked,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    )
  }
}
