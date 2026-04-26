import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { addComment } from "@vireon/db"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const postId = typeof body.postId === "string" ? body.postId : undefined
    const commentBody = typeof body.body === "string" ? body.body : ""

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      )
    }

    const comment = await addComment({
      userId,
      postId,
      body: commentBody,
    })

    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "EMPTY_COMMENT") {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === "COMMENT_TOO_LONG") {
      return NextResponse.json(
        { error: "Comment is too long" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    )
  }
}