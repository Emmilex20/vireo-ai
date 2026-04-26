import { db } from "./index"

export async function toggleFollow(params: {
  followerId: string
  followingId: string
}) {
  if (params.followerId === params.followingId) {
    throw new Error("CANNOT_FOLLOW_SELF")
  }

  const existing = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: params.followerId,
        followingId: params.followingId,
      },
    },
  })

  if (existing) {
    await db.follow.delete({
      where: { id: existing.id },
    })

    return { following: false }
  }

  await db.follow.create({
    data: {
      followerId: params.followerId,
      followingId: params.followingId,
    },
  })

  return { following: true }
}

export async function getFollowingIds(userId: string) {
  const rows = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })

  return rows.map((row) => row.followingId)
}

export async function getCreatorProfileById(
  viewerId: string | null,
  creatorId: string
) {
  const user = await db.user.findUnique({
    where: { id: creatorId },
    include: {
      profile: true,
      posts: {
        where: {
          visibility: "public",
        },
        include: {
          asset: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  })

  if (!user) return null

  let isFollowing = false

  if (viewerId) {
    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: creatorId,
        },
      },
    })

    isFollowing = !!existing
  }

  return {
    ...user,
    isFollowing,
  }
}
