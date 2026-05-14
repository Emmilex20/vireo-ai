# Level 2 AI Foundation

This note documents the backend-only intelligence layer added for prompt quality,
creative memory, and future fine-tuning/RAG workflows. It does not change the
current UI.

## What Was Added

- Prompt intelligence services in `apps/web/src/lib/ai/`
  - `prompt-engine.ts`: deterministic local prompt enhancement, intent detection,
    model-aware formatting hints, Afro/Nigerian cinematic context detection, and
    useful negative prompt generation.
  - `character-memory.ts`: builds reusable character identity prompt fragments.
  - `story-memory.ts`: builds story continuity prompt context.
  - `generation-context.ts`: combines raw prompt, enhanced prompt, optional
    character memory, optional story memory, mode, provider, and model into a
    safe generation context object.
  - `types.ts`: shared TypeScript types for the intelligence layer.

- Character memory foundation in Prisma and DB services
  - Prisma model: `CharacterProfile`
  - DB service: `packages/db/src/character-profiles.ts`
  - Core functions: `createCharacterProfile`, `getUserCharacterProfiles`,
    `getCharacterProfileById`, `buildCharacterPromptMemory`

- Story memory foundation in Prisma and DB services
  - Prisma model: `StoryMemory`
  - DB service: `packages/db/src/story-memory.ts`
  - Core functions: `createStoryMemory`, `updateStoryMemory`, `getStoryMemory`,
    `getUserStoryMemories`, `buildStoryContextForPrompt`

## How Prompt Enhancement Works

The prompt engine is deterministic and local. It does not call a paid LLM or
require any new environment variables. It lightly expands eligible image, video,
and character prompts with production-oriented details such as composition,
lighting, temporal consistency, identity consistency, and provider/model hints.

If prompt enhancement fails, generation continues with the original prompt.
Errors are logged server-side only.

## Current Integration

The intelligence layer is used before provider calls in:

- Image generation API
- Video generation API
- Character generation API
- Video project scene image/video processing
- Provider fallback polling for image/video jobs

Generation quotes still use the original user prompt, so prompt enhancement does
not increase user credit cost or cause duplicate deductions. Existing refund and
failure paths remain unchanged.

For `GenerationJob` records, raw prompts stay in `prompt`. The enhanced/final
prompt metadata is stored in `settings.generationContext` where the existing
settings JSON field is available.

## Future Steps

- Add UI for selecting saved `CharacterProfile` and `StoryMemory` records.
- Attach selected memory IDs to generation requests.
- Add RAG retrieval over prior prompts, assets, story notes, and character
  records.
- Add LoRA/fine-tuning job tracking once a provider workflow is selected.
- Add offline evaluation examples for prompt enhancement quality.
