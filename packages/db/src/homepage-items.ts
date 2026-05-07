import { randomUUID } from "node:crypto"

import { db } from "./index"

export type HomepageSection =
  | "spotlight"
  | "suite"
  | "latest_models"
  | "inspiration_image"
  | "inspiration_video"

export type HomepageMediaType = "image" | "video"

export type HomepageItemInput = {
  section: HomepageSection
  title: string
  subtitle?: string | null
  href?: string | null
  mediaType: HomepageMediaType
  mediaUrl: string
  posterUrl?: string | null
  sourceAssetId?: string | null
  sourceGenerationJobId?: string | null
  sortOrder?: number
  isActive?: boolean
  createdByAdminId?: string | null
}

export type HomepageItemRow = {
  id: string
  section: HomepageSection
  title: string
  subtitle: string | null
  href: string | null
  mediaType: HomepageMediaType
  mediaUrl: string
  posterUrl: string | null
  sourceAssetId: string | null
  sourceGenerationJobId: string | null
  sortOrder: number
  isActive: boolean
  createdByAdminId: string | null
  createdAt: Date
  updatedAt: Date
}

type HomepageCandidateRow = {
  id: string
  mediaType: HomepageMediaType
  title: string | null
  prompt: string | null
  fileUrl: string
  thumbnailUrl: string | null
  createdAt: Date
  userId: string | null
  userEmail: string | null
  username: string | null
  displayName: string | null
  generationJobId: string | null
  modelId: string | null
  jobType: string | null
  jobPrompt: string | null
  homepageItems:
    | Array<{ id: string; section: HomepageSection; title: string; isActive: boolean }>
    | null
}

export async function getPublishedHomepageItems() {
  return db.$queryRaw<HomepageItemRow[]>`
    SELECT
      "id",
      "section",
      "title",
      "subtitle",
      "href",
      "mediaType",
      "mediaUrl",
      "posterUrl",
      "sourceAssetId",
      "sourceGenerationJobId",
      "sortOrder",
      "isActive",
      "createdByAdminId",
      "createdAt",
      "updatedAt"
    FROM "HomepageItem"
    WHERE "isActive" = true
    ORDER BY "section" ASC, "sortOrder" ASC, "createdAt" DESC
  `
}

export async function getAdminHomepageItems() {
  return db.$queryRaw<HomepageItemRow[]>`
    SELECT
      "id",
      "section",
      "title",
      "subtitle",
      "href",
      "mediaType",
      "mediaUrl",
      "posterUrl",
      "sourceAssetId",
      "sourceGenerationJobId",
      "sortOrder",
      "isActive",
      "createdByAdminId",
      "createdAt",
      "updatedAt"
    FROM "HomepageItem"
    ORDER BY "section" ASC, "sortOrder" ASC, "createdAt" DESC
  `
}

export async function getHomepageCandidates() {
  const rows = await db.$queryRaw<HomepageCandidateRow[]>`
    SELECT
      a."id",
      CASE
        WHEN a."mimeType" ILIKE 'video/%'
          OR a."fileUrl" ILIKE '%.mp4%'
          OR a."fileUrl" ILIKE '%.webm%'
          OR a."fileUrl" ILIKE '%.mov%'
          OR a."fileUrl" ILIKE '%.m4v%'
          OR gj."type" = 'video'
          OR a."type" = 'video'
        THEN 'video'
        ELSE 'image'
      END AS "mediaType",
      a."title",
      a."prompt",
      a."fileUrl",
      a."thumbnailUrl",
      a."createdAt",
      u."id" AS "userId",
      u."email" AS "userEmail",
      u."username",
      u."displayName",
      gj."id" AS "generationJobId",
      gj."modelId",
      gj."type" AS "jobType",
      gj."prompt" AS "jobPrompt",
      COALESCE(
        json_agg(
          json_build_object(
            'id', hi."id",
            'section', hi."section",
            'title', hi."title",
            'isActive', hi."isActive"
          )
        ) FILTER (WHERE hi."id" IS NOT NULL),
        '[]'::json
      ) AS "homepageItems"
    FROM "Asset" a
    LEFT JOIN "GenerationJob" gj ON gj."id" = a."generationJobId"
    LEFT JOIN "User" u ON u."id" = a."userId"
    LEFT JOIN "HomepageItem" hi ON hi."sourceAssetId" = a."id"
    WHERE a."fileUrl" IS NOT NULL
      AND (
        a."mimeType" ILIKE 'image/%'
        OR a."mimeType" ILIKE 'video/%'
        OR a."fileUrl" ILIKE '%.jpg%'
        OR a."fileUrl" ILIKE '%.jpeg%'
        OR a."fileUrl" ILIKE '%.png%'
        OR a."fileUrl" ILIKE '%.webp%'
        OR a."fileUrl" ILIKE '%.gif%'
        OR a."fileUrl" ILIKE '%.mp4%'
        OR a."fileUrl" ILIKE '%.webm%'
        OR a."fileUrl" ILIKE '%.mov%'
        OR a."fileUrl" ILIKE '%.m4v%'
        OR a."type" IN ('image', 'video')
        OR gj."type" IN ('image', 'video')
      )
      AND (gj."id" IS NULL OR gj."status" = 'completed')
    GROUP BY a."id", u."id", gj."id"
    ORDER BY a."createdAt" DESC
    LIMIT 300
  `

  return rows.map((row) => ({
    id: row.id,
    mediaType: row.mediaType,
    title: row.title,
    prompt: row.prompt,
    fileUrl: row.fileUrl,
    thumbnailUrl: row.thumbnailUrl,
    createdAt: row.createdAt,
    user: row.userId
      ? {
          id: row.userId,
          email: row.userEmail,
          username: row.username,
          displayName: row.displayName,
        }
      : null,
    generationJob: row.generationJobId
      ? {
          id: row.generationJobId,
          modelId: row.modelId,
          type: row.jobType,
          prompt: row.jobPrompt,
        }
      : null,
    homepageItems: row.homepageItems ?? [],
  }))
}

export async function createHomepageItem(input: HomepageItemInput) {
  const id = `home_${randomUUID()}`
  const sourceAssetId = input.sourceAssetId ?? null
  const sourceGenerationJobId = input.sourceGenerationJobId ?? null
  const createdByAdminId = input.createdByAdminId ?? null

  const rows = await db.$queryRaw<HomepageItemRow[]>`
    INSERT INTO "HomepageItem" (
      "id",
      "section",
      "title",
      "subtitle",
      "href",
      "mediaType",
      "mediaUrl",
      "posterUrl",
      "sourceAssetId",
      "sourceGenerationJobId",
      "sortOrder",
      "isActive",
      "createdByAdminId",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${input.section},
      ${input.title},
      ${input.subtitle ?? null},
      ${input.href ?? null},
      ${input.mediaType},
      ${input.mediaUrl},
      ${input.posterUrl ?? null},
      (SELECT "id" FROM "Asset" WHERE "id" = ${sourceAssetId} LIMIT 1),
      (SELECT "id" FROM "GenerationJob" WHERE "id" = ${sourceGenerationJobId} LIMIT 1),
      ${input.sortOrder ?? 0},
      ${input.isActive ?? true},
      (SELECT "id" FROM "User" WHERE "id" = ${createdByAdminId} LIMIT 1),
      NOW(),
      NOW()
    )
    RETURNING *
  `

  return rows[0]
}

export async function updateHomepageItem(
  itemId: string,
  input: Partial<Omit<HomepageItemInput, "createdByAdminId">>
) {
  const existingRows = await db.$queryRaw<HomepageItemRow[]>`
    SELECT * FROM "HomepageItem" WHERE "id" = ${itemId} LIMIT 1
  `
  const existing = existingRows[0]

  if (!existing) {
    throw new Error("Homepage item not found")
  }

  const sourceAssetId =
    input.sourceAssetId === undefined ? existing.sourceAssetId : input.sourceAssetId
  const sourceGenerationJobId =
    input.sourceGenerationJobId === undefined
      ? existing.sourceGenerationJobId
      : input.sourceGenerationJobId

  const rows = await db.$queryRaw<HomepageItemRow[]>`
    UPDATE "HomepageItem"
    SET
      "section" = ${input.section ?? existing.section},
      "title" = ${input.title ?? existing.title},
      "subtitle" = ${
        input.subtitle === undefined ? existing.subtitle : input.subtitle
      },
      "href" = ${input.href === undefined ? existing.href : input.href},
      "mediaType" = ${input.mediaType ?? existing.mediaType},
      "mediaUrl" = ${input.mediaUrl ?? existing.mediaUrl},
      "posterUrl" = ${
        input.posterUrl === undefined ? existing.posterUrl : input.posterUrl
      },
      "sourceAssetId" = (SELECT "id" FROM "Asset" WHERE "id" = ${sourceAssetId} LIMIT 1),
      "sourceGenerationJobId" = (SELECT "id" FROM "GenerationJob" WHERE "id" = ${sourceGenerationJobId} LIMIT 1),
      "sortOrder" = ${input.sortOrder ?? existing.sortOrder},
      "isActive" = ${input.isActive ?? existing.isActive},
      "updatedAt" = NOW()
    WHERE "id" = ${itemId}
    RETURNING *
  `

  return rows[0]
}

export async function deleteHomepageItem(itemId: string) {
  await db.$executeRaw`
    DELETE FROM "HomepageItem" WHERE "id" = ${itemId}
  `

  return { id: itemId }
}
