import { db } from "./index"
import { createNotification } from "./notifications"

export async function toggleAssetLike(params: {
  userId: string
  assetId: string
}) {
  const existing = await db.assetLike.findUnique({
    where: {
      userId_assetId: {
        userId: params.userId,
        assetId: params.assetId,
      },
    },
  })

  if (existing) {
    await db.assetLike.delete({ where: { id: existing.id } })
    return { liked: false }
  }

  await db.assetLike.create({
    data: {
      userId: params.userId,
      assetId: params.assetId,
    },
  })

  const asset = await db.asset.findUnique({
    where: { id: params.assetId },
    select: { userId: true },
  })

  if (asset) {
    await createNotification({
      userId: asset.userId,
      actorId: params.userId,
      type: "like",
      assetId: params.assetId,
    })
  }

  return { liked: true }
}

export async function toggleAssetSave(params: {
  userId: string
  assetId: string
}) {
  const existing = await db.assetSave.findUnique({
    where: {
      userId_assetId: {
        userId: params.userId,
        assetId: params.assetId,
      },
    },
  })

  if (existing) {
    await db.assetSave.delete({ where: { id: existing.id } })
    return { saved: false }
  }

  await db.assetSave.create({
    data: {
      userId: params.userId,
      assetId: params.assetId,
    },
  })

  const asset = await db.asset.findUnique({
    where: { id: params.assetId },
    select: { userId: true },
  })

  if (asset) {
    await createNotification({
      userId: asset.userId,
      actorId: params.userId,
      type: "save",
      assetId: params.assetId,
    })
  }

  return { saved: true }
}
