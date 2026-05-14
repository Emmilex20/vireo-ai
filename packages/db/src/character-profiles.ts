import { Prisma } from "@prisma/client"
import { db } from "./index"

type CharacterProfileLike = {
  id?: string
  name?: string | null
  description?: string | null
  visualTraits?: string | null
  outfit?: string | null
  style?: string | null
  voiceNotes?: string | null
  referenceImageUrl?: string | null
  preferredPromptFragment?: string | null
}

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}

function nullableText(value: string | null | undefined) {
  const cleaned = cleanText(value)

  return cleaned || null
}

export async function createCharacterProfile(params: {
  userId: string
  name: string
  description?: string | null
  visualTraits?: string | null
  outfit?: string | null
  style?: string | null
  voiceNotes?: string | null
  referenceImageUrl?: string | null
  preferredPromptFragment?: string | null
  metadata?: Prisma.InputJsonValue | null
}) {
  const name = cleanText(params.name)

  if (!name) {
    throw new Error("Character profile name is required")
  }

  return db.characterProfile.create({
    data: {
      userId: params.userId,
      name,
      description: nullableText(params.description),
      visualTraits: nullableText(params.visualTraits),
      outfit: nullableText(params.outfit),
      style: nullableText(params.style),
      voiceNotes: nullableText(params.voiceNotes),
      referenceImageUrl: nullableText(params.referenceImageUrl),
      preferredPromptFragment: nullableText(params.preferredPromptFragment),
      metadata:
        params.metadata === null ? Prisma.JsonNull : params.metadata ?? undefined,
    },
  })
}

export async function getUserCharacterProfiles(userId: string) {
  return db.characterProfile.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getCharacterProfileById(params: {
  userId: string
  characterProfileId: string
}) {
  return db.characterProfile.findFirst({
    where: {
      id: params.characterProfileId,
      userId: params.userId,
    },
  })
}

export function buildCharacterPromptMemory(
  profile: CharacterProfileLike | null | undefined
) {
  if (!profile) return undefined

  const segments = [
    cleanText(profile.name) ? `name: ${cleanText(profile.name)}` : undefined,
    cleanText(profile.description)
      ? `description: ${cleanText(profile.description)}`
      : undefined,
    cleanText(profile.visualTraits)
      ? `visual traits: ${cleanText(profile.visualTraits)}`
      : undefined,
    cleanText(profile.outfit) ? `outfit: ${cleanText(profile.outfit)}` : undefined,
    cleanText(profile.style) ? `style: ${cleanText(profile.style)}` : undefined,
    cleanText(profile.voiceNotes)
      ? `voice notes: ${cleanText(profile.voiceNotes)}`
      : undefined,
    cleanText(profile.preferredPromptFragment) || undefined,
    cleanText(profile.referenceImageUrl)
      ? `reference image: ${cleanText(profile.referenceImageUrl)}`
      : undefined,
  ].filter(Boolean)

  if (!segments.length) return undefined

  return [
    `Character memory: ${segments.join("; ")}.`,
    "Keep identity and recognizable traits consistent.",
  ].join(" ")
}
