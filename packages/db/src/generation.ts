import { Prisma } from "@prisma/client"
import { db } from "./index"
import { createAssetFromCompletedJob } from "./assets"
import { rewardReferral } from "./referrals"
import { refundFailedGenerationJob } from "./refunds"

function isUnknownModelIdArgumentError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("Unknown argument `modelId`")
  )
}

export async function createImageJob(params: {
  userId: string
  prompt: string
  negativePrompt?: string
  modelId?: string
  sourceImageUrl?: string
  credits: number
  providerName?: string
  providerJobId?: string
  style?: string
  aspectRatio?: string
  qualityMode?: string
  promptBoost?: boolean
  seed?: number | null
  steps?: number
  guidance?: number
}) {
  const data = {
    userId: params.userId,
    modelId: params.modelId ?? null,
    type: "image",
    status: "processing",
    providerName: params.providerName ?? null,
    providerJobId: params.providerJobId ?? null,
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    sourceImageUrl: params.sourceImageUrl ?? null,
    creditsUsed: params.credits,
    style: params.style ?? null,
    aspectRatio: params.aspectRatio ?? null,
    qualityMode: params.qualityMode ?? null,
    promptBoost: params.promptBoost ?? true,
    seed: params.seed ?? null,
    steps: params.steps ?? null,
    guidance: params.guidance ?? null,
  }

  try {
    return await db.generationJob.create({ data })
  } catch (error) {
    if (!isUnknownModelIdArgumentError(error)) {
      throw error
    }

    const { modelId: _modelId, ...legacyData } = data
    return db.generationJob.create({
      data: legacyData,
    })
  }
}

export async function createVideoJob(params: {
  userId: string
  prompt: string
  negativePrompt?: string
  modelId?: string
  sourceImageUrl?: string
  sourceAssetId?: string
  credits: number
  providerName?: string
  providerJobId?: string
  aspectRatio?: string
  duration?: number
  motionIntensity?: string
  cameraMove?: string
  styleStrength?: string
  motionGuidance?: number
  shotType?: string
  fps?: number
  settings?: Prisma.InputJsonValue | null
}) {
  const data = {
    userId: params.userId,
    modelId: params.modelId ?? null,
    type: "video",
    status: "processing",
    providerName: params.providerName ?? null,
    providerJobId: params.providerJobId ?? null,
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    sourceImageUrl: params.sourceImageUrl ?? null,
    sourceAssetId: params.sourceAssetId ?? null,
    creditsUsed: params.credits,
    aspectRatio: params.aspectRatio ?? null,
    duration: params.duration ?? null,
    motionIntensity: params.motionIntensity ?? null,
    cameraMove: params.cameraMove ?? null,
    styleStrength: params.styleStrength ?? null,
    motionGuidance: params.motionGuidance ?? null,
    shotType: params.shotType ?? null,
    fps: params.fps ?? null,
    settings:
      params.settings === null
        ? Prisma.JsonNull
        : params.settings ?? undefined,
  }

  try {
    return await db.generationJob.create({ data })
  } catch (error) {
    if (!isUnknownModelIdArgumentError(error)) {
      throw error
    }

    const { modelId: _modelId, ...legacyData } = data
    return db.generationJob.create({
      data: legacyData,
    })
  }
}

export async function createAudioJob(params: {
  userId: string
  prompt: string
  modelId?: string
  credits: number
  providerName?: string
  providerJobId?: string
  style?: string
  speed?: number
  settings?: Prisma.InputJsonValue | null
}) {
  const data = {
    userId: params.userId,
    modelId: params.modelId ?? null,
    type: "audio",
    status: "processing",
    providerName: params.providerName ?? null,
    providerJobId: params.providerJobId ?? null,
    prompt: params.prompt,
    creditsUsed: params.credits,
    style: params.style ?? null,
    guidance: params.speed ?? null,
    settings:
      params.settings === null
        ? Prisma.JsonNull
        : params.settings ?? undefined,
  }

  try {
    return await db.generationJob.create({ data })
  } catch (error) {
    if (!isUnknownModelIdArgumentError(error)) {
      throw error
    }

    const { modelId: _modelId, ...legacyData } = data
    return db.generationJob.create({
      data: legacyData,
    })
  }
}

export async function updateGenerationJobProvider(params: {
  jobId: string
  providerName: string
  providerJobId: string
}) {
  return db.generationJob.update({
    where: { id: params.jobId },
    data: {
      providerName: params.providerName,
      providerJobId: params.providerJobId,
    },
  })
}

export async function completeImageJob(params: {
  jobId: string
  outputUrl: string
  storageProvider?: string
  storageUrl?: string
  storagePublicId?: string | null
  storageStatus?: string
  storageReason?: string | null
}) {
  const updatedJob = await db.generationJob.update({
    where: { id: params.jobId },
    data: {
      status: "completed",
      outputUrl: params.outputUrl,
      storageProvider: params.storageProvider ?? null,
      storageUrl: params.storageUrl ?? params.outputUrl,
      storagePublicId: params.storagePublicId ?? null,
      storageStatus: params.storageStatus ?? null,
      storageReason: params.storageReason ?? null,
      completedAt: new Date(),
    },
  })

  await createAssetFromCompletedJob({
    userId: updatedJob.userId,
    generationJobId: updatedJob.id,
    fileUrl: params.outputUrl,
    prompt: updatedJob.prompt ?? undefined,
    title: updatedJob.prompt
      ? updatedJob.prompt.slice(0, 40)
      : "Generated image",
    type: "image",
    mediaType: "image",
    mimeType: "image/jpeg",
  })

  await rewardReferral(updatedJob.userId)

  return updatedJob
}

export async function completeVideoJob(params: {
  jobId: string
  outputUrl: string
  storageProvider?: string
  storageUrl?: string
  storagePublicId?: string | null
  storageStatus?: string
  storageReason?: string | null
}) {
  const updatedJob = await db.generationJob.update({
    where: { id: params.jobId },
    data: {
      status: "completed",
      outputUrl: params.outputUrl,
      storageProvider: params.storageProvider ?? null,
      storageUrl: params.storageUrl ?? params.outputUrl,
      storagePublicId: params.storagePublicId ?? null,
      storageStatus: params.storageStatus ?? null,
      storageReason: params.storageReason ?? null,
      completedAt: new Date(),
    },
  })

  await createAssetFromCompletedJob({
    userId: updatedJob.userId,
    generationJobId: updatedJob.id,
    fileUrl: params.outputUrl,
    prompt: updatedJob.prompt ?? undefined,
    title: updatedJob.prompt
      ? `Video - ${updatedJob.prompt.slice(0, 36)}`
      : "Generated video",
    type: "video",
    mediaType: "video",
    mimeType: "video/mp4",
  })

  await rewardReferral(updatedJob.userId)

  return updatedJob
}

export async function completeAudioJob(params: {
  jobId: string
  outputUrl: string
  storageProvider?: string
  storageUrl?: string
  storagePublicId?: string | null
  storageStatus?: string
  storageReason?: string | null
}) {
  const updatedJob = await db.generationJob.update({
    where: { id: params.jobId },
    data: {
      status: "completed",
      outputUrl: params.outputUrl,
      storageProvider: params.storageProvider ?? null,
      storageUrl: params.storageUrl ?? params.outputUrl,
      storagePublicId: params.storagePublicId ?? null,
      storageStatus: params.storageStatus ?? null,
      storageReason: params.storageReason ?? null,
      completedAt: new Date(),
    },
  })

  await createAssetFromCompletedJob({
    userId: updatedJob.userId,
    generationJobId: updatedJob.id,
    fileUrl: params.outputUrl,
    prompt: updatedJob.prompt ?? undefined,
    title: updatedJob.prompt
      ? `Audio - ${updatedJob.prompt.slice(0, 36)}`
      : "Generated audio",
    type: "audio",
    mediaType: "audio",
    mimeType: "audio/mpeg",
  })

  await rewardReferral(updatedJob.userId)

  return updatedJob
}

export async function failImageJob(jobId: string, failureReason?: string) {
  const failedJob = await db.generationJob.update({
    where: { id: jobId },
    data: {
      status: "failed",
      failureReason: failureReason ?? "Image generation failed",
    },
  })

  await refundFailedGenerationJob(failedJob.id)

  return db.generationJob.findUniqueOrThrow({
    where: { id: failedJob.id },
  })
}

export async function failVideoJob(jobId: string, failureReason?: string) {
  const failedJob = await db.generationJob.update({
    where: { id: jobId },
    data: {
      status: "failed",
      failureReason: failureReason ?? "Video generation failed",
    },
  })

  await refundFailedGenerationJob(failedJob.id)

  return db.generationJob.findUniqueOrThrow({
    where: { id: failedJob.id },
  })
}

export async function failAudioJob(jobId: string, failureReason?: string) {
  const failedJob = await db.generationJob.update({
    where: { id: jobId },
    data: {
      status: "failed",
      failureReason: failureReason ?? "Audio generation failed",
    },
  })

  await refundFailedGenerationJob(failedJob.id)

  return db.generationJob.findUniqueOrThrow({
    where: { id: failedJob.id },
  })
}

export async function getGenerationJobById(jobId: string, userId: string) {
  return db.generationJob.findFirst({
    where: {
      id: jobId,
      userId,
    },
  })
}

export async function getUserGenerationHistory(userId: string) {
  return db.generationJob.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  })
}
