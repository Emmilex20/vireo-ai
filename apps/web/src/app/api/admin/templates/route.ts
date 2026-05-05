import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createTemplate, getAdminTemplates } from "@vireon/db";
import { z } from "zod";

import { requireAdminUserId } from "@/lib/admin-auth";

const templateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  type: z.enum(["image", "video"]),
  category: z.string().trim().min(1).max(60),
  prompt: z.string().trim().min(1).max(6000),
  negativePrompt: z.string().trim().max(3000).nullable().optional(),
  previewUrl: z.string().trim().url(),
  thumbnailUrl: z.string().trim().url().nullable().optional(),
  sourceAssetId: z.string().trim().min(1).nullable().optional(),
  sourceGenerationJobId: z.string().trim().min(1).nullable().optional(),
  modelId: z.string().trim().max(120).nullable().optional(),
  settings: z.record(z.string(), z.unknown()).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET() {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const templates = await getAdminTemplates();

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("[admin/templates] Failed to load templates", error);
    return NextResponse.json(
      { error: "Failed to load templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = templateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid template", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const template = await createTemplate({
      ...parsed.data,
      settings: parsed.data.settings as Prisma.InputJsonValue | null | undefined,
      createdByAdminId: adminId,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("[admin/templates] Failed to create template", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
