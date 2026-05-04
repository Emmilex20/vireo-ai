import { CharacterPageClient } from "@/components/character/character-page-client";
import { auth } from "@clerk/nextjs/server";
import { getUserCharacters } from "@vireon/db";

export default async function CharacterPage() {
  const { userId } = await auth();
  const characters = userId ? await getUserCharacters(userId) : [];

  return (
    <main className="h-[calc(100dvh-8.4rem)] overflow-hidden px-2 pb-2 pt-1 sm:h-[calc(100dvh-9rem)] sm:p-3 lg:h-[calc(100dvh-6rem)] lg:p-4">
      <CharacterPageClient hasCharacters={characters.length > 0} />
    </main>
  );
}
