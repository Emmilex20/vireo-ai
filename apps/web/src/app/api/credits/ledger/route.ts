import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserCreditLedger } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ledger = await getUserCreditLedger(userId)

  return NextResponse.json({ ledger })
}
