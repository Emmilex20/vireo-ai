import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@vireon/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ credits: 0 });
  }

  const wallet = await db.creditWallet.findUnique({
    where: { userId },
    select: { balance: true },
  });

  return NextResponse.json({ credits: wallet?.balance ?? 0 });
}
