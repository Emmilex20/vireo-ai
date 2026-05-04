import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getGenerationJobById,
  getUserCharacter,
  updateCharacterGenerationResult,
} from "@vireon/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { characterId } = await params;
  let character = await getUserCharacter({ userId, characterId });

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  if (
    character.generationJobId &&
    character.status === "processing"
  ) {
    const job = await getGenerationJobById(character.generationJobId, userId);

    if (job?.status === "completed" || job?.status === "failed") {
      character = await updateCharacterGenerationResult({
        characterId: character.id,
        userId,
        status: job.status === "completed" ? "completed" : "failed",
        imageUrl: job.outputUrl ?? null,
        failureReason: job.failureReason ?? null,
      });
    }
  }

  return NextResponse.json({ character });
}
