import { db } from "./index"

export async function toggleLike(params: { userId: string; postId: string }) {
  const existingLike = await db.like.findUnique({
    where: {
      userId_postId: {
        userId: params.userId,
        postId: params.postId,
      },
    },
  })

  if (existingLike) {
    await db.$transaction([
      db.like.delete({
        where: { id: existingLike.id },
      }),
      db.publishedPost.update({
        where: { id: params.postId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      }),
    ])

    return { liked: false }
  }

  await db.$transaction([
    db.like.create({
      data: {
        userId: params.userId,
        postId: params.postId,
      },
    }),
    db.publishedPost.update({
      where: { id: params.postId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    }),
  ])

  return { liked: true }
}

export async function getLikedPostIds(userId: string) {
  const likes = await db.like.findMany({
    where: { userId },
    select: { postId: true },
  })

  return likes.map((like: (typeof likes)[number]) => like.postId)
}
