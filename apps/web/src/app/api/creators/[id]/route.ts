import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCreatorProfileById } from "@vireon/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  const creator = await getCreatorProfileById(userId ?? null, id)

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 })
  }

  return NextResponse.json({ creator })
}
