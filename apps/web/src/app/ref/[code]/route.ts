import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const res = NextResponse.redirect(`${appUrl}/sign-up`)

  res.cookies.set("ref", code, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return res
}
