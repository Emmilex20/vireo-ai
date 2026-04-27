import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
  getFollowingExploreFeed,
  getLikedPostIds,
  getPublicExploreFeed,
} from "@vireon/db"

type ExplorePost =
  | Awaited<ReturnType<typeof getFollowingExploreFeed>>[number]
  | Awaited<ReturnType<typeof getPublicExploreFeed>>[number];

export async function GET(req: Request) {
  const { userId } = await auth()
  const { searchParams } = new URL(req.url)

  const tab = searchParams.get("tab") || "recommended"

  const posts =
    tab === "following" && userId
      ? await getFollowingExploreFeed(userId)
      : await getPublicExploreFeed()

  let likedPostIds: string[] = []

  if (userId) {
    likedPostIds = await getLikedPostIds(userId)
  }

  const enrichedPosts = posts.map((post: ExplorePost) => ({
    ...post,
    likedByCurrentUser: likedPostIds.includes(post.id),
  }))

  return NextResponse.json({ posts: enrichedPosts })
}
