import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProviderEnvStatus } from "@/lib/ai/providers/provider-env";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export async function GET() {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    providers: getProviderEnvStatus(),
  });
}
