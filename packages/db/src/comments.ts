import { db } from "./index"

export async function addComment(params: {
  userId: string
  postId: string
  body: string
}) {
  const trimmedBody = params.body.trim()

  if (!trimmedBody) {
    throw new Error("EMPTY_COMMENT")
  }

  if (trimmedBody.length > 500) {
    throw new Error("COMMENT_TOO_LONG")
  }

  const [comment] = await db.$transaction([
    db.comment.create({
      data: {
        userId: params.userId,
        postId: params.postId,
        body: trimmedBody,
      },
      include: {
        user: true,
      },
    }),
    db.publishedPost.update({
      where: { id: params.postId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    }),
  ])

  return comment
}

export async function getPostComments(postId: string) {
  return db.comment.findMany({
    where: { postId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}