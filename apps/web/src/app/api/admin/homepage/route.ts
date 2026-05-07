import { NextResponse } from "next/server";
import {
  createHomepageItem,
  getAdminHomepageItems,
  type HomepageMediaType,
  type HomepageSection,
} from "@vireon/db";
import { z } from "zod";

import { requireAdminUserId } from "@/lib/admin-auth";

const homepageItemSchema = z.object({
  section: z.enum([
    "spotlight",
    "suite",
    "latest_models",
    "inspiration_image",
    "inspiration_video",
  ]),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(220).nullable().optional(),
  href: z.string().trim().max(220).nullable().optional(),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string().trim().url(),
  posterUrl: z.string().trim().url().nullable().optional(),
  sourceAssetId: z.string().trim().min(1).nullable().optional(),
  sourceGenerationJobId: z.string().trim().min(1).nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const items = await getAdminHomepageItems();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[admin/homepage] Failed to load homepage items", error);
    return NextResponse.json(
      { error: "Failed to load homepage items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = homepageItemSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid homepage item", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const item = await createHomepageItem({
      ...parsed.data,
      section: parsed.data.section as HomepageSection,
      mediaType: parsed.data.mediaType as HomepageMediaType,
      createdByAdminId: adminId,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("[admin/homepage] Failed to create homepage item", error);
    return NextResponse.json(
      { error: "Failed to create homepage item" },
      { status: 500 }
    );
  }
}
