import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import { createUserIfNotExists } from "@vireon/db"
import { db } from "@vireon/db"
import { sendWelcomeEmailNotification } from "@/lib/email/notifications"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await currentUser()
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  const createdUser = await createUserIfNotExists({
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress,
    fullName: user?.fullName ?? undefined,
    avatarUrl: user?.imageUrl,
  })

  const referralCode = (await cookies()).get("ref")?.value

  if (referralCode && !createdUser.referredById && createdUser.referralCode !== referralCode) {
    const referrer = await db.user.findFirst({
      where: { referralCode },
      select: { id: true },
    })

    if (referrer && referrer.id !== createdUser.id) {
      await db.user.update({
        where: { id: createdUser.id },
        data: { referredById: referrer.id },
      })
    }
  }

  if (!existingUser) {
    await sendWelcomeEmailNotification({
      email: user?.emailAddresses[0]?.emailAddress,
      name: user?.fullName,
    })
  }

  return NextResponse.json({ success: true })
}
