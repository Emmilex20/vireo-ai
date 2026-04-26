import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const wallet = await db.creditWallet.findUnique({
    where: { userId },
  })

  return NextResponse.json({
    balance: wallet?.balance ?? 0,
  })
}
