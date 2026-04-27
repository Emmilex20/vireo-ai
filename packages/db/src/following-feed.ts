import { db } from "./index"

export async function getFollowingFeed(userId: string) {
  const follows = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })

  const followingIds = follows.map(
    (follow: (typeof follows)[number]) => follow.followingId
  )

  if (followingIds.length === 0) {
    return []
  }

  return db.asset.findMany({
    where: {
      isPublic: true,
      userId: {
        in: followingIds,
      },
    },
    include: {
      user: {
        select: {
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
      generationJob: true,
      likes: {
        where: { userId },
        select: { id: true },
      },
      saves: {
        where: { userId },
        select: { id: true },
      },
      _count: {
        select: {
          likes: true,
          saves: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
