import { db } from "./index"

export async function getSavedAssets(userId: string) {
  return db.assetSave.findMany({
    where: { userId },
    include: {
      asset: {
        include: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
