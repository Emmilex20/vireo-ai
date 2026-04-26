import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@vireon/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await db.subscription.findFirst({
    where: { userId }
  });

  const renewals = await db.subscriptionRenewal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12
  });

  return NextResponse.json({ subscription, renewals });
}
