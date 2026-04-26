import { NextResponse } from "next/server"
import { db } from "@vireon/db"

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: "ok",
      db: "connected",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
      },
      { status: 500 }
    )
  }
}
