import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDiscoverCreators } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()
  const creators = await getDiscoverCreators(userId ?? undefined)

  return NextResponse.json({
    creators: creators.map((creator) => ({
      ...creator,
      isFollowing: Boolean(creator.followers?.length),
    })),
  })
}
