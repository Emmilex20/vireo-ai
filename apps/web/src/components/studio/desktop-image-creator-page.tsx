"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ChevronRight,
  Download,
  FolderOpen,
  HelpCircle,
  History,
  ImageIcon,
  ImagePlus,
  Layers3,
  Lightbulb,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Upload,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react";

import { PromptTemplatesPanel } from "@/components/prompts/prompt-templates-panel";
import { Button } from "@/components/ui/button";
import {
  listReplicateImageModels,
  type ReplicateImageModelConfig,
  type ReplicateImageModelId,
} from "@/lib/ai/providers/replicate-image-models";
import { aspectRatios, imageStyles } from "@/lib/studio-data";
import { cn } from "@/lib/utils";
import type { StudioMode } from "./studio-mode-config";
import { StudioHomeSidebar } from "./studio-home-sidebar";

type Draft = {
  id: string;
  modelId?: ReplicateImageModelId | null;
  title: string;
  prompt: string;
  negativePrompt?: string | null;
  style?: string | null;
  aspectRatio?: string | null;
  qualityMode?: string | null;
  promptBoost: boolean;
  seed?: number | null;
  steps?: number | null;
  guidance?: number | null;
  updatedAt: string;
  referenceImageUrl?: string | null;
};

type DesktopImageCreatorPageProps = {
  onChangeMode?: (mode: StudioMode) => void;
  selectedModelId: ReplicateImageModelId;
  onModelChange: (value: ReplicateImageModelId) => void;
  supportsReferenceImage: boolean;
  referenceImageUrl: string;
  referenceImageName: string | null;
  uploadingReferenceImage: boolean;
  onReferenceImageUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveReferenceImage: () => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  onClearPrompt: () => void;
  onResetSession: () => void;
  selectedStyle: string;
  onStyleChange: (value: string) => void;
  selectedAspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  qualityMode: "standard" | "high" | "ultra";
  onQualityModeChange: (value: "standard" | "high" | "ultra") => void;
  imageCost: number;
  image: string | null;
  loading: boolean;
  canGenerate: boolean;
  onGenerate: () => Promise<void>;
  canGenerateVariation: boolean;
  onGenerateVariation: () => Promise<void>;
  advancedOpen: boolean;
  onToggleAdvancedOpen: () => void;
  supportsSeed: boolean;
  supportsSteps: boolean;
  supportsGuidance: boolean;
  promptBoost: boolean;
  onPromptBoostChange: (value: boolean) => void;
  seed: string;
  onSeedChange: (value: string) => void;
  steps: number;
  onStepsChange: (value: number) => void;
  guidance: number;
  onGuidanceChange: (value: number) => void;
  draftTitle: string;
  onDraftTitleChange: (value: string) => void;
  savingDraft: boolean;
  onSaveDraft: () => Promise<void>;
  drafts: Draft[];
  activeDraftId: string | null;
  deletingDraftId: string | null;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => Promise<void>;
  selectedSuggestion: string | null;
  onSuggestionSelect: (value: string) => void;
  lastAction: string | null;
};

const qualityModes: Array<{
  value: "standard" | "high" | "ultra";
  label: string;
  detail: string;
}> = [
  { value: "standard", label: "Standard", detail: "Fast" },
  { value: "high", label: "High", detail: "Balanced" },
  { value: "ultra", label: "Ultra", detail: "Premium" },
];

const promptStarters = [
  "A cinematic portrait with natural window light, shallow depth of field, refined skin detail, editorial color grading",
  "A premium product shot on a clean set, soft reflections, sharp commercial lighting, realistic material texture",
  "A wide establishing scene with atmospheric depth, layered foreground elements, dramatic sky, production design detail",
  "A playful 3D character render with expressive pose, polished surfaces, studio lighting, clean background",
];

export function DesktopImageCreatorPage({
  selectedModelId,
  onModelChange,
  supportsReferenceImage,
  referenceImageUrl,
  referenceImageName,
  uploadingReferenceImage,
  onReferenceImageUpload,
  onRemoveReferenceImage,
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  onClearPrompt,
  onResetSession,
  selectedStyle,
  onStyleChange,
  selectedAspectRatio,
  onAspectRatioChange,
  qualityMode,
  onQualityModeChange,
  imageCost,
  image,
  loading,
  canGenerate,
  onGenerate,
  canGenerateVariation,
  onGenerateVariation,
  advancedOpen,
  onToggleAdvancedOpen,
  supportsSeed,
  supportsSteps,
  supportsGuidance,
  promptBoost,
  onPromptBoostChange,
  seed,
  onSeedChange,
  steps,
  onStepsChange,
  guidance,
  onGuidanceChange,
  draftTitle,
  onDraftTitleChange,
  savingDraft,
  onSaveDraft,
  drafts,
  activeDraftId,
  deletingDraftId,
  onLoadDraft,
  onDeleteDraft,
  selectedSuggestion,
  onSuggestionSelect,
  lastAction,
  onChangeMode,
}: DesktopImageCreatorPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState<"assist" | "drafts" | "settings">("assist");
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const imageModels = listReplicateImageModels();
  const selectedModel =
    imageModels.find((model) => model.id === selectedModelId) ?? imageModels[0];
  const activeDraftTitle = useMemo(
    () => drafts.find((draft) => draft.id === activeDraftId)?.title,
    [activeDraftId, drafts]
  );
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const hasResult = Boolean(image);

  function appendPrompt(value: string) {
    const next = prompt.trim() ? `${prompt.trim()}, ${value}` : value;
    onPromptChange(next);
    onSuggestionSelect(value);
  }

  function replacePrompt(value: string) {
    onPromptChange(value);
    onSuggestionSelect(value);
  }

  return (
    <div className="hidden h-screen overflow-hidden bg-[#090b0d] text-white lg:flex">
      <StudioHomeSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        onChangeMode={onChangeMode}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d1012] px-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <span>Create</span>
              <span>/</span>
              <span className="text-white/80">Image Studio</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-base font-semibold tracking-tight">Generate Image</h1>
              {activeDraftTitle ? (
                <span className="rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 px-2.5 py-1 text-xs text-[#9ff5e8]">
                  Draft: {activeDraftTitle}
                </span>
              ) : null}
              {lastAction ? (
                <span className="max-w-md truncate text-xs text-white/45">{lastAction}</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/explore"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <HelpCircle className="size-4" />
              Help
            </Link>
            <Link
              href="/assets"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <FolderOpen className="size-4" />
              Assets
            </Link>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(420px,1fr)_288px] bg-[#0f1215]">
          <section className="min-h-0 overflow-y-auto border-r border-white/10 bg-[#111519] p-3 [scrollbar-color:#3b424a_transparent] [scrollbar-width:thin]">
            <div className="space-y-3">
              <Panel>
                <PanelHeader
                  icon={Sparkles}
                  title="Model"
                  description={selectedModel.description}
                />
                <button
                  type="button"
                  onClick={() => setModelPickerOpen(true)}
                  className="mt-4 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-[#2dd4bf]/35 hover:bg-white/8"
                >
                  <ImageModelGlyph model={selectedModel} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-white/45">Model</span>
                    <span className="block truncate text-sm font-semibold text-white">
                      {selectedModel.label}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-white/45" />
                </button>
              </Panel>

              <Panel>
                <div className="flex items-start justify-between gap-4">
                  <PanelHeader
                    icon={Wand2}
                    title="Prompt"
                    description="Describe subject, setting, light, material, camera, and mood."
                  />
                  <button
                    type="button"
                    onClick={onClearPrompt}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#0b0e10] px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50 transition hover:border-white/18 hover:bg-white/8 hover:text-white"
                  >
                    <X className="size-3.5" />
                    Clear
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={prompt}
                  onChange={(event) => onPromptChange(event.target.value)}
                  placeholder="A cinematic image of..."
                  className="mt-3 min-h-36 w-full resize-none rounded-xl border border-white/10 bg-[#0b0e10] px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
                />

                <div className="mt-3 flex items-center justify-between text-xs text-white/45">
                  <span>{wordCount} words</span>
                  <label className="flex items-center gap-2">
                    <span>Auto polish</span>
                    <Toggle checked={promptBoost} onChange={onPromptBoostChange} />
                  </label>
                </div>
              </Panel>

              <Panel>
                <PanelHeader
                  icon={Layers3}
                  title="Reference"
                  description={
                    supportsReferenceImage
                      ? "Attach a guide image for composition or style."
                      : "This model does not accept reference images."
                  }
                />
                {supportsReferenceImage ? (
                  <div className="mt-4">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#0b0e10] p-3 transition hover:border-[#2dd4bf]/35 hover:bg-white/5">
                      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/8">
                        {referenceImageUrl ? (
                          <Image
                            src={referenceImageUrl}
                            alt="Reference"
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : uploadingReferenceImage ? (
                          <Loader2 className="size-5 animate-spin text-white/70" />
                        ) : (
                          <Upload className="size-5 text-white/70" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {referenceImageName || "Upload image reference"}
                        </span>
                        <span className="mt-1 block text-xs text-white/45">PNG, JPG, or WEBP</span>
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(event) => void onReferenceImageUpload(event)}
                      />
                    </label>
                    {referenceImageUrl ? (
                      <button
                        type="button"
                        onClick={onRemoveReferenceImage}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <X className="size-3.5" />
                        Remove reference
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/50">
                    Switch to Seedream 4.5 for guided image generation.
                  </div>
                )}
              </Panel>

              <Panel>
                <PanelHeader icon={ImageIcon} title="Look And Frame" description="Choose the visual style, shape, and quality." />
                <div className="mt-4 space-y-4">
                  <div>
                    <Label>Style</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {imageStyles.map((style) => (
                        <Chip
                          key={style}
                          active={selectedStyle === style}
                          onClick={() => onStyleChange(style)}
                        >
                          {style}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Aspect ratio</Label>
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {aspectRatios.map((ratio) => (
                        <button
                          key={ratio.value}
                          type="button"
                          onClick={() => onAspectRatioChange(ratio.value)}
                          className={cn(
                            "h-10 rounded-lg border text-xs font-medium transition",
                            selectedAspectRatio === ratio.value
                              ? "border-white bg-white text-black"
                              : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Quality</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {qualityModes.map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => onQualityModeChange(mode.value)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-left transition",
                            qualityMode === mode.value
                              ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-white"
                              : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <span className="block text-xs font-semibold">{mode.label}</span>
                          <span className="mt-0.5 block text-[11px] text-white/40">{mode.detail}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </section>

          <section className="flex min-h-0 flex-col bg-[#0c0f12]">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ImagePlus className="size-4 text-[#2dd4bf]" />
                Preview
              </div>
              <div className="flex items-center gap-2 text-xs text-white/45">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  {selectedModel.label}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  {selectedAspectRatio}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 capitalize">
                  {qualityMode}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 p-3">
              <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,#10161a,#090b0d_55%,#14110f)]">
                {image ? (
                  <Image
                    src={image}
                    alt="Generated image"
                    fill
                    sizes="(min-width: 1280px) 52vw, 100vw"
                    className="object-contain"
                  />
                ) : (
                  <div className="mx-auto max-w-md px-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      {loading ? (
                        <Loader2 className="size-7 animate-spin text-[#2dd4bf]" />
                      ) : (
                        <ImagePlus className="size-7 text-white/65" />
                      )}
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">
                      {loading ? "Generating your image" : "Your image appears here"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      {loading
                        ? "The job is running. You can keep tuning your next prompt while the result lands."
                        : "Write a prompt, pick a model, and create. Completed generations are saved to Assets."}
                    </p>
                  </div>
                )}

                {loading ? (
                  <div className="absolute inset-x-6 bottom-6 rounded-xl border border-[#2dd4bf]/25 bg-[#061817]/90 p-3 text-sm text-[#b7fff5] backdrop-blur">
                    Generation in progress
                  </div>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#0d1012] p-3">
              <div className="flex items-center gap-3">
                <CostBadge cost={imageCost} />
                <Button
                  onClick={() => void onGenerate()}
                  disabled={!canGenerate}
                  className="h-10 flex-1 rounded-xl bg-[#2dd4bf] text-sm font-semibold text-black hover:bg-[#5eead4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate image"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onGenerateVariation()}
                  disabled={!canGenerateVariation}
                  className="h-10 rounded-xl border-white/10 bg-white/5 px-3 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <RotateCcw className="mr-2 size-4" />
                  Variation
                </Button>
                {hasResult ? (
                  <a
                    href={image ?? undefined}
                    download
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <Download className="size-4" />
                    Download
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-col border-l border-white/10 bg-[#111519]">
            <div className="grid h-11 shrink-0 grid-cols-3 border-b border-white/10 p-1.5">
              {([
                ["assist", Wand2, "Assist"],
                ["drafts", History, "Drafts"],
                ["settings", Settings2, "Tune"],
              ] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRightPanel(key)}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg text-xs font-medium transition",
                    rightPanel === key
                      ? "bg-white text-black"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-color:#3b424a_transparent] [scrollbar-width:thin]">
              {rightPanel === "assist" ? (
                <AssistPanel
                  selectedSuggestion={selectedSuggestion}
                  onSelect={onSuggestionSelect}
                  onAppend={appendPrompt}
                  onReplace={replacePrompt}
                  onUseTemplate={(template) => {
                    onPromptChange(template.prompt);
                    onNegativePromptChange(template.negativePrompt ?? "");
                  }}
                />
              ) : null}

              {rightPanel === "drafts" ? (
                <DraftsPanel
                  drafts={drafts}
                  activeDraftId={activeDraftId}
                  deletingDraftId={deletingDraftId}
                  draftTitle={draftTitle}
                  savingDraft={savingDraft}
                  onDraftTitleChange={onDraftTitleChange}
                  onSaveDraft={onSaveDraft}
                  onLoadDraft={onLoadDraft}
                  onDeleteDraft={onDeleteDraft}
                  onResetSession={onResetSession}
                />
              ) : null}

              {rightPanel === "settings" ? (
                <SettingsPanel
                  advancedOpen={advancedOpen}
                  onToggleAdvancedOpen={onToggleAdvancedOpen}
                  supportsSeed={supportsSeed}
                  supportsSteps={supportsSteps}
                  supportsGuidance={supportsGuidance}
                  seed={seed}
                  onSeedChange={onSeedChange}
                  steps={steps}
                  onStepsChange={onStepsChange}
                  guidance={guidance}
                  onGuidanceChange={onGuidanceChange}
                  negativePrompt={negativePrompt}
                  onNegativePromptChange={onNegativePromptChange}
                  selectedModelLabel={selectedModel.label}
                />
              ) : null}
            </div>
          </section>
        </div>
      </main>
      {modelPickerOpen ? (
        <ImageModelPickerModal
          models={imageModels}
          selectedModelId={selectedModelId}
          onClose={() => setModelPickerOpen(false)}
          onSelect={(modelId) => {
            onModelChange(modelId);
            setModelPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function ImageModelPickerModal({
  models,
  selectedModelId,
  onSelect,
  onClose,
}: {
  models: ReplicateImageModelConfig[];
  selectedModelId: ReplicateImageModelId;
  onSelect: (modelId: ReplicateImageModelId) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const selectedModel =
    models.find((model) => model.id === selectedModelId) ?? models[0];
  const recommendedModels = models.filter((model) => model.recommended).slice(0, 3);
  const filteredModels = models.filter((model) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;

    return [model.label, model.provider, model.description, model.badge, model.features.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-5 py-6 backdrop-blur-sm">
      <div className="flex h-[min(86vh,820px)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#1a1d20] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 px-5">
          <div>
            <h2 className="text-base font-semibold text-white">Models</h2>
            <p className="mt-1 text-xs text-white/45">
              Select the image model for the current generation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-white/55 transition hover:bg-white/8 hover:text-white"
            aria-label="Close model picker"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-color:#59616a_transparent] [scrollbar-width:thin]">
          <p className="mb-3 text-xs font-medium text-white/55">Recommended</p>
          <div className="grid gap-3 lg:grid-cols-3">
            {recommendedModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => onSelect(model.id)}
                className={cn(
                  "group relative h-32 overflow-hidden rounded-xl border p-4 text-left transition",
                  model.id === selectedModel.id
                    ? "border-fuchsia-400 bg-white/8"
                    : "border-white/10 bg-white/5 hover:border-white/25"
                )}
              >
                <div className={cn("absolute inset-0 bg-linear-to-br", model.heroTone ?? "from-zinc-700 via-zinc-950 to-black")} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.62))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.26),transparent_32%)] opacity-70" />
                <div className="relative flex h-full flex-col justify-end">
                  <h3 className="text-lg font-semibold leading-tight text-white">
                    {model.label}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-white/70">
                    {model.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-[#16191c] p-3">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/8 pb-3">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
                All models
              </span>
              <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
                All providers
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
                All features
              </span>
              <label className="flex min-w-44 items-center gap-2 rounded-full border border-white/10 bg-[#0d1012] px-3 py-1.5 text-xs text-white/55">
                <Search className="size-4" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/45"
                />
              </label>
            </div>

            <div className="mt-2 max-h-[46vh] overflow-y-auto pr-1 [scrollbar-color:#59616a_transparent] [scrollbar-width:thin]">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => onSelect(model.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition",
                    model.id === selectedModelId
                      ? "bg-white/18 text-white"
                      : "text-white/72 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <ImageModelGlyph model={model} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{model.label}</span>
                      {model.badge ? (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            model.fast
                              ? "bg-fuchsia-500/30 text-fuchsia-200"
                              : "bg-emerald-500/20 text-emerald-300"
                          )}
                        >
                          {model.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-white/42">
                      {model.description}
                    </span>
                  </span>
                  <span className="hidden max-w-[46%] flex-wrap justify-end gap-1.5 lg:flex">
                    {model.features.slice(0, 5).map((feature) => (
                      <span
                        key={feature}
                        className="rounded-md bg-white/8 px-2 py-1 text-[11px] font-medium text-white/45"
                      >
                        {feature}
                      </span>
                    ))}
                  </span>
                </button>
              ))}

              {filteredModels.length === 0 ? (
                <div className="py-12 text-center text-sm text-white/45">
                  No models match your search.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageModelGlyph({ model }: { model: ReplicateImageModelConfig }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(45,212,191,0.28),rgba(99,102,241,0.24))] text-xs font-bold text-white">
      {model.provider.slice(0, 2).toUpperCase()}
    </span>
  );
}

function CostBadge({ cost }: { cost: number }) {
  return (
    <div className="inline-flex h-10 min-w-28 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#2dd4bf]/25 bg-[#061817] px-3 text-[#b7fff5] shadow-[0_0_24px_rgba(45,212,191,0.08)]">
      <span className="text-base font-semibold tabular-nums leading-none">{cost}</span>
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#b7fff5]/65">
        credits
      </span>
    </div>
  );
}

function AssistPanel({
  selectedSuggestion,
  onSelect,
  onAppend,
  onReplace,
  onUseTemplate,
}: {
  selectedSuggestion: string | null;
  onSelect: (value: string) => void;
  onAppend: (value: string) => void;
  onReplace: (value: string) => void;
  onUseTemplate: (template: { prompt: string; negativePrompt?: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader icon={Lightbulb} title="Prompt Starters" description="Use or append a ready direction." />
        <div className="mt-4 space-y-2">
          {promptStarters.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => onSelect(starter)}
              className={cn(
                "w-full rounded-xl border p-3 text-left text-xs leading-5 transition",
                selectedSuggestion === starter
                  ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-white"
                  : "border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white"
              )}
            >
              {starter}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!selectedSuggestion}
            onClick={() => selectedSuggestion && onReplace(selectedSuggestion)}
            className="h-9 rounded-lg border border-white/10 bg-white/5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-40"
          >
            Replace
          </button>
          <button
            type="button"
            disabled={!selectedSuggestion}
            onClick={() => selectedSuggestion && onAppend(selectedSuggestion)}
            className="h-9 rounded-lg border border-white/10 bg-white/5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-40"
          >
            Append
          </button>
        </div>
      </Panel>

      <div className="[&>div]:rounded-xl [&>div]:border-white/10 [&>div]:bg-white/5">
        <PromptTemplatesPanel type="image" onUseTemplate={onUseTemplate} />
      </div>
    </div>
  );
}

function DraftsPanel({
  drafts,
  activeDraftId,
  deletingDraftId,
  draftTitle,
  savingDraft,
  onDraftTitleChange,
  onSaveDraft,
  onLoadDraft,
  onDeleteDraft,
  onResetSession,
}: {
  drafts: Draft[];
  activeDraftId: string | null;
  deletingDraftId: string | null;
  draftTitle: string;
  savingDraft: boolean;
  onDraftTitleChange: (value: string) => void;
  onSaveDraft: () => Promise<void>;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => Promise<void>;
  onResetSession: () => void;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader icon={Save} title="Save Setup" description="Store this prompt and model configuration." />
        <input
          value={draftTitle}
          onChange={(event) => onDraftTitleChange(event.target.value)}
          placeholder="Draft title"
          className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e10] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
        />
        <Button
          type="button"
          onClick={() => void onSaveDraft()}
          disabled={savingDraft}
          className="mt-3 h-10 w-full rounded-xl bg-white text-black hover:bg-white/90"
        >
          {savingDraft ? "Saving..." : "Save draft"}
        </Button>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between gap-3">
          <PanelHeader icon={History} title="Drafts" description={`${drafts.length} saved setups`} />
          <button
            type="button"
            onClick={onResetSession}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Reset
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {drafts.length ? (
            drafts.map((draft) => (
              <div
                key={draft.id}
                className={cn(
                  "rounded-xl border p-3",
                  activeDraftId === draft.id
                    ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10"
                    : "border-white/10 bg-white/4"
                )}
              >
                <button
                  type="button"
                  onClick={() => onLoadDraft(draft)}
                  className="block w-full text-left"
                >
                  <span className="block truncate text-sm font-semibold text-white">{draft.title}</span>
                  <span className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{draft.prompt}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void onDeleteDraft(draft.id)}
                  disabled={deletingDraftId === draft.id}
                  className="mt-3 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  {deletingDraftId === draft.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0b0e10] p-4 text-sm leading-6 text-white/45">
              Saved drafts will appear here after you name and save a setup.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function SettingsPanel({
  advancedOpen,
  onToggleAdvancedOpen,
  supportsSeed,
  supportsSteps,
  supportsGuidance,
  seed,
  onSeedChange,
  steps,
  onStepsChange,
  guidance,
  onGuidanceChange,
  negativePrompt,
  onNegativePromptChange,
  selectedModelLabel,
}: {
  advancedOpen: boolean;
  onToggleAdvancedOpen: () => void;
  supportsSeed: boolean;
  supportsSteps: boolean;
  supportsGuidance: boolean;
  seed: string;
  onSeedChange: (value: string) => void;
  steps: number;
  onStepsChange: (value: number) => void;
  guidance: number;
  onGuidanceChange: (value: number) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  selectedModelLabel: string;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <PanelHeader icon={Settings2} title="Advanced" description={selectedModelLabel} />
          <button
            type="button"
            onClick={onToggleAdvancedOpen}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            {advancedOpen ? "Hide" : "Show"}
          </button>
        </div>

        {advancedOpen ? (
          <div className="mt-4 space-y-4">
            <div>
              <Label>Negative prompt</Label>
              <textarea
                rows={4}
                value={negativePrompt}
                onChange={(event) => onNegativePromptChange(event.target.value)}
                placeholder="Things to avoid..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#0b0e10] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
              />
            </div>

            {supportsSeed ? (
              <div>
                <Label>Seed</Label>
                <input
                  value={seed}
                  onChange={(event) => onSeedChange(event.target.value)}
                  placeholder="Optional fixed seed"
                  inputMode="numeric"
                  className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#0b0e10] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
                />
              </div>
            ) : null}

            {supportsSteps ? (
              <Slider
                label="Steps"
                value={steps}
                min={10}
                max={50}
                step={1}
                onChange={onStepsChange}
              />
            ) : null}

            {supportsGuidance ? (
              <Slider
                label="Guidance"
                value={guidance}
                min={1}
                max={20}
                step={0.5}
                onChange={onGuidanceChange}
                display={guidance.toFixed(1)}
              />
            ) : null}

            {!supportsSeed && !supportsSteps && !supportsGuidance ? (
              <div className="rounded-xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/45">
                This model manages seed, steps, and guidance automatically.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/45">
            Open advanced controls to tune negative prompt, seeds, steps, and guidance when the selected model supports them.
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171b20] p-3 shadow-[0_14px_36px_rgba(0,0,0,0.18)]">
      {children}
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#2dd4bf]">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-white/45">{description}</span>
      </span>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div className="text-xs font-medium uppercase tracking-[0.14em] text-white/40">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#b7fff5]"
          : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-[#2dd4bf]" : "bg-white/15"
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1 size-4 rounded-full bg-white transition",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs text-white/60">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[#2dd4bf]"
      />
    </div>
  );
}
