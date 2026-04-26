import { db } from "./index";

export async function getSourceAssetForGeneration(params: {
  userId: string;
  sourceAssetId: string;
}) {
  return db.asset.findFirst({
    where: {
      id: params.sourceAssetId,
      userId: params.userId
    }
  });
}
