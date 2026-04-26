import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { toggleCreatorFollow } from "@vireon/db"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    if (!body.creatorId) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 })
    }

    const result = await toggleCreatorFollow({
      followerId: userId,
      followingId: body.creatorId,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.message === "CANNOT_FOLLOW_SELF") {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Failed to update follow state" },
      { status: 500 }
    )
  }
}
