import { db } from "./index"
import { createNotification } from "./notifications"

export async function toggleCreatorFollow(params: {
  followerId: string
  followingId: string
}) {
  if (params.followerId === params.followingId) {
    throw new Error("CANNOT_FOLLOW_SELF")
  }

  const existing = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: params.followerId,
        followingId: params.followingId,
      },
    },
  })

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } })
    return { following: false }
  }

  await db.follow.create({
    data: params,
  })

  await createNotification({
    userId: params.followingId,
    actorId: params.followerId,
    type: "follow",
  })

  return { following: true }
}
