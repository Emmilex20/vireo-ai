import { randomUUID } from "node:crypto"
import { Prisma } from "@prisma/client"

import { db } from "./index"

export type TemplateStatus = "draft" | "published" | "archived"
export type TemplateType = "image" | "video"

export type TemplateInput = {
  title: string
  type: TemplateType
  category: string
  prompt: string
  negativePrompt?: string | null
  previewUrl: string
  thumbnailUrl?: string | null
  sourceAssetId?: string | null
  sourceGenerationJobId?: string | null
  modelId?: string | null
  settings?: Prisma.InputJsonValue | null
  status?: TemplateStatus
  sortOrder?: number
  createdByAdminId?: string | null
}

type TemplateRow = {
  id: string
  title: string
  type: TemplateType
  category: string
  prompt: string
  negativePrompt: string | null
  previewUrl: string
  thumbnailUrl: string | null
  sourceAssetId: string | null
  sourceGenerationJobId: string | null
  modelId: string | null
  settings: Prisma.JsonValue | null
  status: TemplateStatus
  sortOrder: number
  createdByAdminId: string | null
  createdAt: Date
  updatedAt: Date
}

function jsonValue(value: Prisma.InputJsonValue | null | undefined) {
  return value === undefined || value === null ? null : JSON.stringify(value)
}

export async function getPublishedTemplates() {
  return db.$queryRaw<TemplateRow[]>`
    SELECT
      "id",
      "title",
      "type",
      "category",
      "prompt",
      "negativePrompt",
      "previewUrl",
      "thumbnailUrl",
      "sourceAssetId",
      "sourceGenerationJobId",
      "modelId",
      "settings",
      "status",
      "sortOrder",
      "createdByAdminId",
      "createdAt",
      "updatedAt"
    FROM "Template"
    WHERE "status" = 'published'
    ORDER BY "sortOrder" ASC, "createdAt" DESC
  `
}

export async function getAdminTemplates() {
  return db.$queryRaw<TemplateRow[]>`
    SELECT
      "id",
      "title",
      "type",
      "category",
      "prompt",
      "negativePrompt",
      "previewUrl",
      "thumbnailUrl",
      "sourceAssetId",
      "sourceGenerationJobId",
      "modelId",
      "settings",
      "status",
      "sortOrder",
      "createdByAdminId",
      "createdAt",
      "updatedAt"
    FROM "Template"
    ORDER BY "status" ASC, "sortOrder" ASC, "createdAt" DESC
  `
}

type CandidateRow = {
  id: string
  mediaType: TemplateType
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
  jobType: TemplateType | null
  jobPrompt: string | null
  negativePrompt: string | null
  style: string | null
  aspectRatio: string | null
  qualityMode: string | null
  promptBoost: boolean | null
  seed: number | null
  steps: number | null
  guidance: number | null
  duration: number | null
  motionIntensity: string | null
  cameraMove: string | null
  styleStrength: string | null
  motionGuidance: number | null
  shotType: string | null
  fps: number | null
  providerName: string | null
  providerJobId: string | null
  templates: Array<{ id: string; title: string; status: TemplateStatus }> | null
}

export async function getTemplateCandidates() {
  const rows = await db.$queryRaw<CandidateRow[]>`
    SELECT
      a."id",
      a."mediaType",
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
      gj."negativePrompt",
      gj."style",
      gj."aspectRatio",
      gj."qualityMode",
      gj."promptBoost",
      gj."seed",
      gj."steps",
      gj."guidance",
      gj."duration",
      gj."motionIntensity",
      gj."cameraMove",
      gj."styleStrength",
      gj."motionGuidance",
      gj."shotType",
      gj."fps",
      gj."providerName",
      gj."providerJobId",
      COALESCE(
        json_agg(
          json_build_object(
            'id', t."id",
            'title', t."title",
            'status', t."status"
          )
        ) FILTER (WHERE t."id" IS NOT NULL),
        '[]'::json
      ) AS "templates"
    FROM "Asset" a
    INNER JOIN "GenerationJob" gj ON gj."id" = a."generationJobId"
    LEFT JOIN "User" u ON u."id" = a."userId"
    LEFT JOIN "Template" t ON t."sourceAssetId" = a."id"
    WHERE gj."status" = 'completed'
      AND gj."outputUrl" IS NOT NULL
    GROUP BY a."id", u."id", gj."id"
    ORDER BY a."createdAt" DESC
    LIMIT 200
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
          negativePrompt: row.negativePrompt,
          style: row.style,
          aspectRatio: row.aspectRatio,
          qualityMode: row.qualityMode,
          promptBoost: row.promptBoost,
          seed: row.seed,
          steps: row.steps,
          guidance: row.guidance,
          duration: row.duration,
          motionIntensity: row.motionIntensity,
          cameraMove: row.cameraMove,
          styleStrength: row.styleStrength,
          motionGuidance: row.motionGuidance,
          shotType: row.shotType,
          fps: row.fps,
          providerName: row.providerName,
          providerJobId: row.providerJobId,
        }
      : null,
    templates: row.templates ?? [],
  }))
}

export async function createTemplate(input: TemplateInput) {
  const id = `tpl_${randomUUID()}`
  const settings = jsonValue(input.settings)
  const sourceAssetId = input.sourceAssetId ?? null
  const sourceGenerationJobId = input.sourceGenerationJobId ?? null
  const createdByAdminId = input.createdByAdminId ?? null
  const rows = await db.$queryRaw<TemplateRow[]>`
    INSERT INTO "Template" (
      "id",
      "title",
      "type",
      "category",
      "prompt",
      "negativePrompt",
      "previewUrl",
      "thumbnailUrl",
      "sourceAssetId",
      "sourceGenerationJobId",
      "modelId",
      "settings",
      "status",
      "sortOrder",
      "createdByAdminId",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${input.title},
      ${input.type},
      ${input.category},
      ${input.prompt},
      ${input.negativePrompt ?? null},
      ${input.previewUrl},
      ${input.thumbnailUrl ?? null},
      (SELECT "id" FROM "Asset" WHERE "id" = ${sourceAssetId} LIMIT 1),
      (SELECT "id" FROM "GenerationJob" WHERE "id" = ${sourceGenerationJobId} LIMIT 1),
      ${input.modelId ?? null},
      ${settings}::jsonb,
      ${input.status ?? "draft"},
      ${input.sortOrder ?? 0},
      (SELECT "id" FROM "User" WHERE "id" = ${createdByAdminId} LIMIT 1),
      NOW(),
      NOW()
    )
    RETURNING *
  `

  return rows[0]
}

export async function updateTemplate(
  templateId: string,
  input: Partial<Omit<TemplateInput, "createdByAdminId">>
) {
  const existingRows = await db.$queryRaw<TemplateRow[]>`
    SELECT * FROM "Template" WHERE "id" = ${templateId} LIMIT 1
  `
  const existing = existingRows[0]

  if (!existing) {
    throw new Error("Template not found")
  }

  const settings = jsonValue(
    input.settings === undefined ? existing.settings : input.settings
  )

  const rows = await db.$queryRaw<TemplateRow[]>`
    UPDATE "Template"
    SET
      "title" = ${input.title ?? existing.title},
      "type" = ${input.type ?? existing.type},
      "category" = ${input.category ?? existing.category},
      "prompt" = ${input.prompt ?? existing.prompt},
      "negativePrompt" = ${
        input.negativePrompt === undefined
          ? existing.negativePrompt
          : input.negativePrompt
      },
      "previewUrl" = ${input.previewUrl ?? existing.previewUrl},
      "thumbnailUrl" = ${
        input.thumbnailUrl === undefined
          ? existing.thumbnailUrl
          : input.thumbnailUrl
      },
      "sourceAssetId" = ${
        input.sourceAssetId === undefined
          ? existing.sourceAssetId
          : input.sourceAssetId
      },
      "sourceGenerationJobId" = ${
        input.sourceGenerationJobId === undefined
          ? existing.sourceGenerationJobId
          : input.sourceGenerationJobId
      },
      "modelId" = ${
        input.modelId === undefined ? existing.modelId : input.modelId
      },
      "settings" = ${settings}::jsonb,
      "status" = ${input.status ?? existing.status},
      "sortOrder" = ${input.sortOrder ?? existing.sortOrder},
      "updatedAt" = NOW()
    WHERE "id" = ${templateId}
    RETURNING *
  `

  return rows[0]
}

export async function deleteTemplate(templateId: string) {
  await db.$executeRaw`
    DELETE FROM "Template" WHERE "id" = ${templateId}
  `

  return { id: templateId }
}
