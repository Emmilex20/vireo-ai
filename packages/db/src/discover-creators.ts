import { db } from "./index"

export async function getDiscoverCreators(currentUserId?: string) {
  return db.user.findMany({
    where: {
      username: {
        not: null,
      },
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      followers: currentUserId
        ? {
            where: { followerId: currentUserId },
            select: { id: true },
          }
        : false,
      _count: {
        select: {
          followers: true,
          following: true,
          assets: {
            where: { isPublic: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
