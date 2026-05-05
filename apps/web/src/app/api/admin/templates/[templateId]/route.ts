import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { deleteTemplate, updateTemplate } from "@vireon/db";
import { z } from "zod";

import { requireAdminUserId } from "@/lib/admin-auth";

const templateUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  type: z.enum(["image", "video"]).optional(),
  category: z.string().trim().min(1).max(60).optional(),
  prompt: z.string().trim().min(1).max(6000).optional(),
  negativePrompt: z.string().trim().max(3000).nullable().optional(),
  previewUrl: z.string().trim().url().optional(),
  thumbnailUrl: z.string().trim().url().nullable().optional(),
  sourceAssetId: z.string().trim().min(1).nullable().optional(),
  sourceGenerationJobId: z.string().trim().min(1).nullable().optional(),
  modelId: z.string().trim().max(120).nullable().optional(),
  settings: z.record(z.string(), z.unknown()).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { templateId } = await params;
  const parsed = templateUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid template update", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const template = await updateTemplate(templateId, {
      ...parsed.data,
      settings: parsed.data.settings as Prisma.InputJsonValue | null | undefined,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[admin/templates] Failed to update template", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { templateId } = await params;
  try {
    await deleteTemplate(templateId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/templates] Failed to delete template", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
