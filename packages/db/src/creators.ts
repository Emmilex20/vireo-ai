import { db } from "./index"

export async function getPublicCreatorProfile(
  username: string,
  currentUserId?: string
) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      followers: {
        select: { id: true },
      },
      following: {
        select: { id: true },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      assets: {
        where: {
          isPublic: true,
        },
        include: {
          generationJob: true,
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!user) {
    throw new Error("CREATOR_NOT_FOUND")
  }

  const isFollowing = currentUserId
    ? await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      })
    : null

  return {
    ...user,
    isFollowing: Boolean(isFollowing),
  }
}
