import { db } from "./index"

export type CharacterStatus = "processing" | "completed" | "failed"

export async function createCharacter(params: {
  userId: string
  generationJobId?: string | null
  name: string
  description?: string | null
  backgroundStory?: string | null
  mode: string
  status?: CharacterStatus
  modelId?: string | null
  prompt?: string | null
  sourceImageUrl?: string | null
  imageUrl?: string | null
  style?: string | null
  vibe?: string | null
  gender?: string | null
  ethnicity?: string | null
  ageRange?: string | null
  count?: number
  creditsUsed?: number
  failureReason?: string | null
}) {
  return db.character.create({
    data: {
      userId: params.userId,
      generationJobId: params.generationJobId ?? null,
      name: params.name,
      description: params.description ?? null,
      backgroundStory: params.backgroundStory ?? null,
      mode: params.mode,
      status: params.status ?? "processing",
      modelId: params.modelId ?? null,
      prompt: params.prompt ?? null,
      sourceImageUrl: params.sourceImageUrl ?? null,
      imageUrl: params.imageUrl ?? null,
      style: params.style ?? null,
      vibe: params.vibe ?? null,
      gender: params.gender ?? null,
      ethnicity: params.ethnicity ?? null,
      ageRange: params.ageRange ?? null,
      count: params.count ?? 1,
      creditsUsed: params.creditsUsed ?? 0,
      failureReason: params.failureReason ?? null,
    },
  })
}

export async function getUserCharacters(userId: string) {
  return db.character.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getUserCharacter(params: {
  userId: string
  characterId: string
}) {
  return db.character.findFirst({
    where: {
      id: params.characterId,
      userId: params.userId,
    },
  })
}

export async function getUserCharacterByJob(params: {
  userId: string
  generationJobId: string
}) {
  return db.character.findFirst({
    where: {
      generationJobId: params.generationJobId,
      userId: params.userId,
    },
  })
}

export async function updateCharacterGenerationResult(params: {
  characterId: string
  userId: string
  status: CharacterStatus
  imageUrl?: string | null
  failureReason?: string | null
}) {
  await db.character.updateMany({
    where: {
      id: params.characterId,
      userId: params.userId,
    },
    data: {
      status: params.status,
      imageUrl: params.imageUrl ?? undefined,
      failureReason: params.failureReason ?? null,
    },
  })

  return db.character.findFirstOrThrow({
    where: {
      id: params.characterId,
      userId: params.userId,
    },
  })
}
