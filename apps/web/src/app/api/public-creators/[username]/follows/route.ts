import { NextResponse } from "next/server"
import { getCreatorFollowLists, getPublicCreatorProfile } from "@vireon/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const creator = await getPublicCreatorProfile(username)
    const lists = await getCreatorFollowLists(creator.id)

    return NextResponse.json(lists)
  } catch {
    return NextResponse.json(
      { error: "Failed to load follow lists" },
      { status: 500 }
    )
  }
}
