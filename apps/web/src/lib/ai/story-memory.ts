import type { StoryMemory } from "./types";

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function textFromUnknown(value: unknown) {
  if (typeof value === "string") return cleanText(value);
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const candidates = [
    record.name,
    record.title,
    record.summary,
    record.description,
    record.role,
  ];

  return candidates
    .filter((candidate): candidate is string => typeof candidate === "string")
    .map(cleanText)
    .filter(Boolean)
    .join(" - ");
}

function summarizeUnknownList(value: unknown, limit = 5) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .map(textFromUnknown)
    .filter(Boolean)
    .slice(0, limit)
    .join("; ");
}

export function buildStoryContextForPrompt(storyMemory?: StoryMemory | null) {
  if (!storyMemory) return undefined;

  const characters = summarizeUnknownList(storyMemory.characters);
  const previousScenes = summarizeUnknownList(
    storyMemory.previousSceneSummaries,
    4
  );

  const segments = [
    cleanText(storyMemory.title)
      ? `story title: ${cleanText(storyMemory.title)}`
      : undefined,
    cleanText(storyMemory.genre) ? `genre: ${storyMemory.genre}` : undefined,
    cleanText(storyMemory.tone) ? `tone: ${storyMemory.tone}` : undefined,
    cleanText(storyMemory.worldSetting)
      ? `world/setting: ${storyMemory.worldSetting}`
      : undefined,
    characters ? `characters involved: ${characters}` : undefined,
    previousScenes ? `previous scene summaries: ${previousScenes}` : undefined,
    cleanText(storyMemory.nextSceneNotes)
      ? `next scene notes: ${storyMemory.nextSceneNotes}`
      : undefined,
  ].filter(Boolean);

  if (!segments.length) return undefined;

  return [
    `Story memory: ${segments.join("; ")}.`,
    "Preserve continuity with the established world, tone, and character context.",
  ].join(" ");
}

export function validateStoryMemoryInput(
  input: Partial<StoryMemory> | null | undefined
) {
  const warnings: string[] = [];

  if (!input) {
    return { valid: false, warnings: ["Story memory input is missing."] };
  }

  if (!cleanText(input.title)) {
    warnings.push("Story title is missing.");
  }

  if (
    !cleanText(input.worldSetting) &&
    !summarizeUnknownList(input.previousSceneSummaries) &&
    !cleanText(input.nextSceneNotes)
  ) {
    warnings.push("Story memory has limited continuity detail.");
  }

  return { valid: warnings.length === 0, warnings };
}
