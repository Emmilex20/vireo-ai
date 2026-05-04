export const CHARACTER_GENERATION_MODEL_ID = "google/nano-banana-pro" as const;
export const CHARACTER_CREDITS_PER_VARIATION = 40;
export const CHARACTER_GENERATION_MODELS = [
  {
    id: "bytedance/seedream-4",
    label: "Seedream 4",
  },
  {
    id: "bytedance/seedream-4.5",
    label: "Seedream 4.5",
  },
  {
    id: "google/nano-banana-pro",
    label: "Nano Banana Pro",
  },
] as const;

export type CharacterGenerationMode = "image" | "describe" | "builder";
export type CharacterGenerationModelId =
  (typeof CHARACTER_GENERATION_MODELS)[number]["id"];

export type CharacterGenerationRequest = {
  mode?: CharacterGenerationMode;
  name?: string;
  description?: string;
  backgroundStory?: string;
  modelId?: string;
  sourceImageUrl?: string;
  style?: string;
  vibe?: string;
  gender?: string;
  ethnicity?: string;
  ageRange?: string;
  count?: number;
};

export function normalizeCharacterCount(count?: number) {
  if (!Number.isFinite(count)) return 1;
  return Math.min(4, Math.max(1, Math.floor(count ?? 1)));
}

export function resolveCharacterGenerationModelId(
  modelId?: string | null
): CharacterGenerationModelId {
  const match = CHARACTER_GENERATION_MODELS.find((model) => model.id === modelId);

  return match?.id ?? CHARACTER_GENERATION_MODEL_ID;
}

export function getCharacterGenerationModelLabel(modelId?: string | null) {
  const resolved = resolveCharacterGenerationModelId(modelId);
  return (
    CHARACTER_GENERATION_MODELS.find((model) => model.id === resolved)?.label ??
    "Nano Banana Pro"
  );
}

export function getCharacterGenerationCost(count?: number) {
  return normalizeCharacterCount(count) * CHARACTER_CREDITS_PER_VARIATION;
}

export function buildCharacterPrompt(input: Required<
  Pick<CharacterGenerationRequest, "mode">
> &
  CharacterGenerationRequest) {
  const count = normalizeCharacterCount(input.count);
  const name = input.name?.trim() || "Unnamed character";
  const description = input.description?.trim();
  const story = input.backgroundStory?.trim();
  const style = input.style?.trim() || "photorealistic";

  const identityParts = [
    input.vibe ? `${input.vibe} look vibe` : null,
    input.gender ? `${input.gender} presentation` : null,
    input.ethnicity ? `${input.ethnicity} ethnicity` : null,
    input.ageRange ? `${input.ageRange} age range` : null,
    description,
    story ? `story context: ${story}` : null,
  ].filter(Boolean);

  const base =
    input.mode === "image"
      ? `Using the uploaded reference image, create a reusable character identity for ${name}. Preserve the person's core facial identity, proportions, and recognizable features while improving studio-quality presentation.`
      : `Create a reusable original character identity for ${name}.`;

  return [
    base,
    identityParts.length
      ? `Character details: ${identityParts.join(", ")}.`
      : "Character details: expressive, memorable, production-ready, easy to reuse across scenes.",
    count === 1
      ? "Make one polished standalone character reference image."
      : `Make polished standalone character reference image ${count}.`,
    "Include a clear front-facing portrait, consistent outfit language, clean silhouette, realistic anatomy, and neutral studio-friendly background.",
    `Visual style: ${style}, premium cinematic quality, sharp focus, refined skin and hair detail, natural lighting.`,
    "Do not add text labels, watermarks, extra limbs, face distortions, duplicate faces, or unrelated people.",
  ].join(" ");
}

export function buildCharacterTitle(input: CharacterGenerationRequest) {
  const name = input.name?.trim();

  if (name) return name.slice(0, 64);

  if (input.vibe || input.gender || input.ageRange) {
    return [input.vibe, input.gender, input.ageRange].filter(Boolean).join(" ");
  }

  return "New Character";
}
