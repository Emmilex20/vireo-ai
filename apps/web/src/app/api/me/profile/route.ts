import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOwnProfile, upsertOwnProfile } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await getOwnProfile(userId)

  return NextResponse.json({ profile })
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    await upsertOwnProfile({
      userId,
      username: body.username,
      fullName: body.fullName,
      bio: body.bio,
      website: body.website,
      location: body.location,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "USERNAME_TOO_SHORT") {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === "USERNAME_INVALID") {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      return NextResponse.json(
        { error: "That username is already taken" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    )
  }
}
