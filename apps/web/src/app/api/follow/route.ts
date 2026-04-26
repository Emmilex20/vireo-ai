import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { toggleFollow } from "@vireon/db"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { creatorId } = body

    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      )
    }

    const result = await toggleFollow({
      followerId: userId,
      followingId: creatorId,
    })

    return NextResponse.json({
      success: true,
      following: result.following,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CANNOT_FOLLOW_SELF") {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    )
  }
}
