import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminAnalytics } from "@vireon/db";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim());

export async function GET() {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await getAdminAnalytics();

  return NextResponse.json(data);
}
