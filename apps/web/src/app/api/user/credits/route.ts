import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserCreditBalance } from "@/lib/credits/credit-service"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const balance = await getUserCreditBalance(userId)

  return NextResponse.json({
    balance: balance.availableCredits,
    availableCredits: balance.availableCredits,
    reservedCredits: balance.reservedCredits,
  })
}
