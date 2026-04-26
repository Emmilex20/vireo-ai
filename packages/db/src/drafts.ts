import { db } from "./index"

export async function createPromptDraft(params: {
  userId: string
  type?: "image" | "video"
  title?: string
  prompt?: string
  negativePrompt?: string

  style?: string
  aspectRatio?: string
  qualityMode?: string
  promptBoost?: boolean
  seed?: number | null
  steps?: number
  guidance?: number

  duration?: number
  motionIntensity?: string
  cameraMove?: string
  styleStrength?: string
  motionGuidance?: number
  shotType?: string
  fps?: number
}) {
  const title = params.title?.trim() ?? ""
  const prompt = params.prompt?.trim() ?? ""

  if (!title) {
    throw new Error("DRAFT_TITLE_REQUIRED")
  }

  if (!prompt || prompt.length < 5) {
    throw new Error("DRAFT_PROMPT_TOO_SHORT")
  }

  return db.promptDraft.create({
    data: {
      userId: params.userId,
      type: params.type ?? "image",
      title,
      prompt,
      negativePrompt: params.negativePrompt?.trim() || null,

      style: params.style || null,
      aspectRatio: params.aspectRatio || null,
      qualityMode: params.qualityMode || null,
      promptBoost: params.promptBoost ?? true,
      seed: params.seed ?? null,
      steps: params.steps ?? null,
      guidance: params.guidance ?? null,

      duration: params.duration ?? null,
      motionIntensity: params.motionIntensity ?? null,
      cameraMove: params.cameraMove ?? null,
      styleStrength: params.styleStrength ?? null,
      motionGuidance: params.motionGuidance ?? null,
      shotType: params.shotType ?? null,
      fps: params.fps ?? null,
    },
  })
}

export async function getUserPromptDrafts(
  userId: string,
  type?: "image" | "video"
) {
  return db.promptDraft.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
    },
    orderBy: { updatedAt: "desc" },
  })
}
