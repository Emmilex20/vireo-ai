import { db } from "./index";

export async function getPublicAssetDetail(assetId: string) {
  return db.asset.findFirst({
    where: {
      id: assetId,
      isPublic: true
    },
    include: {
      user: {
        select: {
          displayName: true,
          username: true,
          avatarUrl: true
        }
      },
      generationJob: true,
      _count: {
        select: {
          likes: true,
          saves: true,
          comments: true
        }
      }
    }
  });
}
