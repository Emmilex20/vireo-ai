import { db } from "./index"

export async function getPublicAssets(userId?: string) {
  return db.asset.findMany({
    where: {
      isPublic: true,
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
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
      saves: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
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
