import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getMyCreatorProfile, updateMyCreatorProfile } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await getMyCreatorProfile(userId)

  return NextResponse.json({ profile })
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const profile = await updateMyCreatorProfile({
      userId,
      displayName: body.displayName,
      username: body.username,
      avatarUrl: body.avatarUrl,
      bio: body.bio,
    })

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    if (error.message === "INVALID_USERNAME") {
      return NextResponse.json(
        {
          error:
            "Username must be 3-24 characters and contain only lowercase letters, numbers, and underscores.",
        },
        { status: 400 }
      )
    }

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Username is already taken." }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 })
  }
}
