import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@vireon/db";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export async function GET() {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await db.promptSafetyLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({ logs });
}
