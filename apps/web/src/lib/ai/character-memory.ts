import type { CharacterMemory } from "./types";

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function uniqueSegments(segments: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return segments
    .map(cleanText)
    .filter(Boolean)
    .filter((segment) => {
      const key = segment.toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function buildCharacterPromptMemory(
  characterMemory?: CharacterMemory | null
) {
  if (!characterMemory) return undefined;

  const segments = uniqueSegments([
    characterMemory.name ? `name: ${characterMemory.name}` : undefined,
    characterMemory.description
      ? `description: ${characterMemory.description}`
      : undefined,
    characterMemory.visualTraits
      ? `visual traits: ${characterMemory.visualTraits}`
      : undefined,
    characterMemory.outfit ? `outfit: ${characterMemory.outfit}` : undefined,
    characterMemory.style ? `style: ${characterMemory.style}` : undefined,
    characterMemory.voiceNotes
      ? `voice notes: ${characterMemory.voiceNotes}`
      : undefined,
    characterMemory.preferredPromptFragment,
    characterMemory.referenceImageUrl
      ? `reference image: ${characterMemory.referenceImageUrl}`
      : undefined,
  ]);

  if (!segments.length) return undefined;

  return [
    `Character memory: ${segments.join("; ")}.`,
    "Keep identity, outfit language, and recognizable traits consistent.",
  ].join(" ");
}

export function validateCharacterMemoryInput(
  input: Partial<CharacterMemory> | null | undefined
) {
  const warnings: string[] = [];

  if (!input) {
    return { valid: false, warnings: ["Character memory input is missing."] };
  }

  if (!cleanText(input.name)) {
    warnings.push("Character name is missing.");
  }

  if (
    !cleanText(input.description) &&
    !cleanText(input.visualTraits) &&
    !cleanText(input.preferredPromptFragment)
  ) {
    warnings.push("Character memory has no reusable visual detail yet.");
  }

  return { valid: warnings.length === 0, warnings };
}
