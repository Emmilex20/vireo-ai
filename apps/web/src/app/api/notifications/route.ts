import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserNotifications, markNotificationsRead } from "@vireon/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const notifications = await getUserNotifications(userId)

  return NextResponse.json({ notifications })
}

export async function PATCH() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await markNotificationsRead(userId)

  return NextResponse.json({ success: true })
}
