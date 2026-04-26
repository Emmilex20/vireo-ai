import { db } from "./index"

export async function createAssetFromCompletedJob(params: {
  userId: string
  generationJobId: string
  fileUrl: string
  prompt?: string
  title?: string
  type?: string
  mediaType?: string
  mimeType?: string
}) {
  const existing = await db.asset.findUnique({
    where: { generationJobId: params.generationJobId },
  })

  if (existing) return existing

  return db.asset.create({
    data: {
      userId: params.userId,
      generationJobId: params.generationJobId,
      type: params.type ?? "image",
      mediaType: params.mediaType ?? "image",
      fileUrl: params.fileUrl,
      prompt: params.prompt ?? null,
      title: params.title ?? null,
      mimeType: params.mimeType ?? null,
      isPublic: false,
    },
  })
}

export async function getUserAssets(userId: string) {
  return db.asset.findMany({
    where: { userId },
    include: {
      generationJob: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
