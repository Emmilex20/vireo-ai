import { buildCharacterPromptMemory } from "./character-memory";
import { buildStoryContextForPrompt } from "./story-memory";
import { buildNegativePrompt, enhancePrompt } from "./prompt-engine";
import type {
  GenerationContext,
  GenerationContextInput,
  JsonObject,
  JsonValue,
  PromptEnhancementResult,
} from "./types";

function cleanPrompt(prompt: string) {
  return prompt.replace(/\s+/g, " ").trim();
}

function uniqueSegments(segments: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return segments
    .map((segment) => cleanPrompt(segment ?? ""))
    .filter(Boolean)
    .filter((segment) => {
      const key = segment.toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function estimateComplexity(prompt: string): GenerationContext["estimatedComplexity"] {
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  const hasCameraLanguage = /\b(camera|cinematic|lighting|scene|motion|shot)\b/i.test(
    prompt
  );

  if (wordCount > 90 || (wordCount > 45 && hasCameraLanguage)) return "high";
  if (wordCount > 25 || hasCameraLanguage) return "medium";

  return "low";
}

function buildFallbackEnhancement(
  input: GenerationContextInput,
  warning?: string
): PromptEnhancementResult {
  const rawPrompt = cleanPrompt(input.rawPrompt);

  return {
    rawPrompt,
    enhancedPrompt: rawPrompt,
    negativePrompt: input.negativePrompt ?? undefined,
    intent: "general",
    warnings: warning ? [warning] : [],
    metadata: {
      engine: "local-deterministic",
      version: "level2-local-v1",
      afroCinematic: false,
      modelFormatted: false,
    },
  };
}

export function buildGenerationContext(
  input: GenerationContextInput
): GenerationContext {
  const rawPrompt = cleanPrompt(input.rawPrompt);
  const warnings: string[] = [];

  if (!rawPrompt) {
    warnings.push("Prompt is empty.");
  }

  const enhancement =
    input.enhance === false
      ? buildFallbackEnhancement(input)
      : enhancePrompt({
          prompt: rawPrompt,
          mode: input.generationMode,
          modelId: input.modelId,
          providerName: input.providerName,
          style: input.style,
          aspectRatio: input.aspectRatio,
          negativePrompt: input.negativePrompt,
        });

  const characterPromptMemory = buildCharacterPromptMemory(input.characterMemory);
  const storyPromptMemory = buildStoryContextForPrompt(input.storyMemory);
  const enhancedPrompt =
    input.enhance === false ? rawPrompt : enhancement.enhancedPrompt;
  const finalPrompt = uniqueSegments([
    storyPromptMemory,
    characterPromptMemory,
    enhancedPrompt,
  ]).join("\n\n");
  const negativePrompt =
    input.enhance === false
      ? input.negativePrompt ?? undefined
      : enhancement.negativePrompt ??
        buildNegativePrompt({
          prompt: rawPrompt,
          mode: input.generationMode,
          modelId: input.modelId,
          providerName: input.providerName,
          negativePrompt: input.negativePrompt,
        });

  return {
    rawPrompt,
    enhancedPrompt,
    finalPrompt: finalPrompt || rawPrompt,
    negativePrompt,
    metadata: {
      promptEngineVersion: enhancement.metadata.version,
      intent: enhancement.intent,
      generationMode: input.generationMode,
      characterMemoryId: input.characterMemory?.id,
      storyMemoryId: input.storyMemory?.id,
      usedPromptEnhancement: input.enhance !== false,
    },
    providerHints: {
      providerName: input.providerName,
      modelId: input.modelId,
      modelFormatted: enhancement.metadata.modelFormatted,
    },
    estimatedComplexity: estimateComplexity(finalPrompt || rawPrompt),
    warnings: [...warnings, ...enhancement.warnings],
  };
}

export function safeBuildGenerationContext(
  input: GenerationContextInput,
  logLabel = "generation-context"
) {
  try {
    return buildGenerationContext(input);
  } catch (error) {
    console.error(`[${logLabel}] prompt intelligence failed`, {
      message: error instanceof Error ? error.message : String(error),
    });

    return buildGenerationContext({
      ...input,
      enhance: false,
    });
  }
}

function stripUndefined(value: unknown): JsonValue {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, stripUndefined(entryValue)])
    ) as JsonObject;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }

  return null;
}

export function serializeGenerationContext(context: GenerationContext) {
  return stripUndefined({
    rawPrompt: context.rawPrompt,
    enhancedPrompt: context.enhancedPrompt,
    finalPrompt: context.finalPrompt,
    negativePrompt: context.negativePrompt,
    metadata: context.metadata,
    providerHints: context.providerHints,
    estimatedComplexity: context.estimatedComplexity,
    warnings: context.warnings,
  }) as JsonObject;
}
