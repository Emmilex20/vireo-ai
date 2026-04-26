import { db } from "./index";

export async function getRelatedGenerationsForAsset(
  assetId: string,
  userId: string
) {
  return db.generationJob.findMany({
    where: {
      userId,
      sourceAssetId: assetId
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
