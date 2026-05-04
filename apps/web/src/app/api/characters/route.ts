import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserCharacters } from "@vireon/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const characters = await getUserCharacters(userId);

  return NextResponse.json({ characters });
}
