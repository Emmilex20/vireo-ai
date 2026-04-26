import { db } from "./index"
import { createNotification } from "./notifications"

export async function getAssetComments(assetId: string) {
  return db.assetComment.findMany({
    where: { assetId },
    include: {
      user: {
        select: {
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createAssetComment(params: {
  userId: string
  assetId: string
  body: string
}) {
  const body = params.body.trim()

  if (body.length < 2) {
    throw new Error("COMMENT_TOO_SHORT")
  }

  const asset = await db.asset.findFirst({
    where: {
      id: params.assetId,
      isPublic: true,
    },
    select: {
      id: true,
      userId: true,
    },
  })

  if (!asset) {
    throw new Error("ASSET_NOT_FOUND")
  }

  const comment = await db.assetComment.create({
    data: {
      userId: params.userId,
      assetId: params.assetId,
      body,
    },
    include: {
      user: {
        select: {
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  })

  await createNotification({
    userId: asset.userId,
    actorId: params.userId,
    type: "comment",
    assetId: params.assetId,
  })

  return comment
}
