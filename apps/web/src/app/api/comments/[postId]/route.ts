import { NextResponse } from "next/server"
import { getPostComments } from "@vireon/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params

  const comments = await getPostComments(postId)

  return NextResponse.json({ comments })
}