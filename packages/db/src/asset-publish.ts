import { db } from "./index";

export async function updateAssetPublishStatus(params: {
  userId: string;
  assetId: string;
  isPublic: boolean;
}) {
  const asset = await db.asset.findFirst({
    where: {
      id: params.assetId,
      userId: params.userId,
    },
  });

  if (!asset) {
    throw new Error("ASSET_NOT_FOUND");
  }

  return db.asset.update({
    where: { id: params.assetId },
    data: { isPublic: params.isPublic },
  });
}
