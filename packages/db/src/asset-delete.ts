import { db } from "./index";

export async function deleteUserAsset(params: {
  userId: string;
  assetId: string;
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

  await db.asset.delete({
    where: {
      id: params.assetId,
    },
  });

  return { success: true };
}
