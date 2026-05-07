import { NextResponse } from "next/server";
import { getHomepageCandidates } from "@vireon/db";

import { requireAdminUserId } from "@/lib/admin-auth";

export async function GET() {
  const adminId = await requireAdminUserId();

  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const candidates = await getHomepageCandidates();

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("[admin/homepage/candidates] Failed to load candidates", error);
    return NextResponse.json(
      { error: "Failed to load homepage candidates" },
      { status: 500 }
    );
  }
}
