import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUnreadNotificationCount } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ count: 0 })
  }

  const count = await getUnreadNotificationCount(userId)

  return NextResponse.json({ count })
}
