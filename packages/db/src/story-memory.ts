import { Prisma } from "@prisma/client"
import { db } from "./index"

type StoryMemoryLike = {
  title?: string | null
  genre?: string | null
  tone?: string | null
  worldSetting?: string | null
  characters?: unknown
  previousSceneSummaries?: unknown
  nextSceneNotes?: string | null
}

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}

function nullableText(value: string | null | undefined) {
  const cleaned = cleanText(value)

  return cleaned || null
}

function textFromUnknown(value: unknown) {
  if (typeof value === "string") return cleanText(value)
  if (!value || typeof value !== "object") return ""

  const record = value as Record<string, unknown>
  const candidates = [
    record.name,
    record.title,
    record.summary,
    record.description,
    record.role,
  ]

  return candidates
    .filter((candidate): candidate is string => typeof candidate === "string")
    .map(cleanText)
    .filter(Boolean)
    .join(" - ")
}

function summarizeUnknownList(value: unknown, limit = 5) {
  const values = Array.isArray(value) ? value : value ? [value] : []

  return values
    .map(textFromUnknown)
    .filter(Boolean)
    .slice(0, limit)
    .join("; ")
}

export async function createStoryMemory(params: {
  userId: string
  title: string
  genre?: string | null
  tone?: string | null
  worldSetting?: string | null
  characters?: Prisma.InputJsonValue | null
  previousSceneSummaries?: Prisma.InputJsonValue | null
  nextSceneNotes?: string | null
  metadata?: Prisma.InputJsonValue | null
}) {
  const title = cleanText(params.title)

  if (!title) {
    throw new Error("Story title is required")
  }

  return db.storyMemory.create({
    data: {
      userId: params.userId,
      title,
      genre: nullableText(params.genre),
      tone: nullableText(params.tone),
      worldSetting: nullableText(params.worldSetting),
      characters:
        params.characters === null
          ? Prisma.JsonNull
          : params.characters ?? undefined,
      previousSceneSummaries:
        params.previousSceneSummaries === null
          ? Prisma.JsonNull
          : params.previousSceneSummaries ?? undefined,
      nextSceneNotes: nullableText(params.nextSceneNotes),
      metadata:
        params.metadata === null ? Prisma.JsonNull : params.metadata ?? undefined,
    },
  })
}

export async function updateStoryMemory(params: {
  userId: string
  storyMemoryId: string
  title?: string | null
  genre?: string | null
  tone?: string | null
  worldSetting?: string | null
  characters?: Prisma.InputJsonValue | null
  previousSceneSummaries?: Prisma.InputJsonValue | null
  nextSceneNotes?: string | null
  metadata?: Prisma.InputJsonValue | null
}) {
  const data: Prisma.StoryMemoryUpdateInput = {}

  if (params.title !== undefined) {
    const title = cleanText(params.title)
    if (!title) throw new Error("Story title is required")
    data.title = title
  }

  if (params.genre !== undefined) data.genre = nullableText(params.genre)
  if (params.tone !== undefined) data.tone = nullableText(params.tone)
  if (params.worldSetting !== undefined) {
    data.worldSetting = nullableText(params.worldSetting)
  }
  if (params.characters !== undefined) {
    data.characters =
      params.characters === null ? Prisma.JsonNull : params.characters
  }
  if (params.previousSceneSummaries !== undefined) {
    data.previousSceneSummaries =
      params.previousSceneSummaries === null
        ? Prisma.JsonNull
        : params.previousSceneSummaries
  }
  if (params.nextSceneNotes !== undefined) {
    data.nextSceneNotes = nullableText(params.nextSceneNotes)
  }
  if (params.metadata !== undefined) {
    data.metadata = params.metadata === null ? Prisma.JsonNull : params.metadata
  }

  return db.storyMemory.update({
    where: {
      id: params.storyMemoryId,
      userId: params.userId,
    },
    data,
  })
}

export async function getStoryMemory(params: {
  userId: string
  storyMemoryId: string
}) {
  return db.storyMemory.findFirst({
    where: {
      id: params.storyMemoryId,
      userId: params.userId,
    },
  })
}

export async function getUserStoryMemories(userId: string) {
  return db.storyMemory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
}

export function buildStoryContextForPrompt(
  memory: StoryMemoryLike | null | undefined
) {
  if (!memory) return undefined

  const characters = summarizeUnknownList(memory.characters)
  const previousScenes = summarizeUnknownList(memory.previousSceneSummaries, 4)
  const segments = [
    cleanText(memory.title) ? `story title: ${cleanText(memory.title)}` : undefined,
    cleanText(memory.genre) ? `genre: ${cleanText(memory.genre)}` : undefined,
    cleanText(memory.tone) ? `tone: ${cleanText(memory.tone)}` : undefined,
    cleanText(memory.worldSetting)
      ? `world/setting: ${cleanText(memory.worldSetting)}`
      : undefined,
    characters ? `characters involved: ${characters}` : undefined,
    previousScenes ? `previous scene summaries: ${previousScenes}` : undefined,
    cleanText(memory.nextSceneNotes)
      ? `next scene notes: ${cleanText(memory.nextSceneNotes)}`
      : undefined,
  ].filter(Boolean)

  if (!segments.length) return undefined

  return [
    `Story memory: ${segments.join("; ")}.`,
    "Preserve continuity with the established world, tone, and character context.",
  ].join(" ")
}
