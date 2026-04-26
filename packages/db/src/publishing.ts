import { db } from "./index"

export async function publishAsset(params: {
  userId: string
  assetId: string
  caption?: string
}) {
  const asset = await db.asset.findFirst({
    where: {
      id: params.assetId,
      userId: params.userId,
    },
  })

  if (!asset) {
    throw new Error("ASSET_NOT_FOUND")
  }

  const existingPost = await db.publishedPost.findUnique({
    where: { assetId: params.assetId },
  })

  if (existingPost) {
    return existingPost
  }

  await db.asset.update({
    where: { id: params.assetId },
    data: { isPublic: true },
  })

  return db.publishedPost.create({
    data: {
      userId: params.userId,
      assetId: params.assetId,
      caption: params.caption,
    },
  })
}

export async function getPublicExploreFeed() {
  return db.publishedPost.findMany({
    where: {
      visibility: "public",
    },
    include: {
      asset: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getFollowingExploreFeed(userId: string) {
  const followedCreators = await db.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  })

  const followingIds = followedCreators.map((item) => item.followingId)

  if (followingIds.length === 0) {
    return []
  }

  return db.publishedPost.findMany({
    where: {
      visibility: "public",
      userId: {
        in: followingIds,
      },
    },
    include: {
      asset: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
