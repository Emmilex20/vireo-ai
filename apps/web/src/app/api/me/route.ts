import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, ensureReferralCode } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const referralCode = await ensureReferralCode(userId)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      referralCode: true,
    },
  })

  return NextResponse.json({
    user,
    referralCode,
  })
}
