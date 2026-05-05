import { NextResponse } from "next/server";
import { getTemplateCandidates } from "@vireon/db";

import { requireAdminUserId } from "@/lib/admin-auth";

export async function GET() {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const candidates = await getTemplateCandidates();

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("[admin/templates/candidates] Failed to load candidates", error);
    return NextResponse.json(
      { error: "Failed to load template candidates" },
      { status: 500 }
    );
  }
}
