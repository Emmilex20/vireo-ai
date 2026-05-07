import { NextResponse } from "next/server";
import {
  deleteHomepageItem,
  updateHomepageItem,
  type HomepageMediaType,
  type HomepageSection,
} from "@vireon/db";
import { z } from "zod";

import { requireAdminUserId } from "@/lib/admin-auth";

const homepageItemUpdateSchema = z.object({
  section: z
    .enum([
      "spotlight",
      "suite",
      "latest_models",
      "inspiration_image",
      "inspiration_video",
    ])
    .optional(),
  title: z.string().trim().min(1).max(120).optional(),
  subtitle: z.string().trim().max(220).nullable().optional(),
  href: z.string().trim().max(220).nullable().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  mediaUrl: z.string().trim().url().optional(),
  posterUrl: z.string().trim().url().nullable().optional(),
  sourceAssetId: z.string().trim().min(1).nullable().optional(),
  sourceGenerationJobId: z.string().trim().min(1).nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { itemId } = await params;
  const parsed = homepageItemUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid homepage item update", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const item = await updateHomepageItem(itemId, {
      ...parsed.data,
      section: parsed.data.section as HomepageSection | undefined,
      mediaType: parsed.data.mediaType as HomepageMediaType | undefined,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[admin/homepage] Failed to update homepage item", error);
    return NextResponse.json(
      { error: "Failed to update homepage item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { itemId } = await params;

  try {
    await deleteHomepageItem(itemId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/homepage] Failed to delete homepage item", error);
    return NextResponse.json(
      { error: "Failed to delete homepage item" },
      { status: 500 }
    );
  }
}
