"use client";

import Image from "next/image";
import { type ChangeEvent, type ReactNode } from "react";
import {
  ChevronDown,
  ImagePlus,
  Layers3,
  Loader2,
  RotateCcw,
  Save,
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
  type ReplicateImageModelId,
} from "@/lib/ai/providers/replicate-image-models";
import { aspectRatios, imageStyles } from "@/lib/studio-data";
import { cn } from "@/lib/utils";
import type { StudioMode } from "./studio-mode-config";

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
};

type Props = {
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

const qualityModes = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
  { value: "ultra", label: "Ultra" },
] as const;

const promptStarters = [
  "A cinematic portrait with natural window light, shallow depth of field, refined skin detail",
  "A premium product shot on a clean set, soft reflections, sharp commercial lighting",
  "A wide atmospheric scene with layered foreground, dramatic sky, production design detail",
];

export function MobileImageCreatorPage({
  onChangeMode,
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
}: Props) {
  const imageModels = listReplicateImageModels();
  const selectedModel =
    imageModels.find((model) => model.id === selectedModelId) ?? imageModels[0];

  return (
    <section className="lg:hidden">
      <div className="space-y-4 pb-28">
        <Panel className="overflow-hidden p-0">
          <div className="relative flex aspect-[4/3] items-center justify-center bg-[#0b0e10]">
            {image ? (
              <Image src={image} alt="Generated" fill sizes="100vw" className="object-contain" />
            ) : (
              <div className="px-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  {loading ? <Loader2 className="size-6 animate-spin text-[#2dd4bf]" /> : <ImagePlus className="size-6 text-white/60" />}
                </div>
                <p className="mt-4 text-sm font-medium text-white">
                  {loading ? "Generating your image" : "Your image appears here"}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Completed images are saved to Assets.
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-3 text-xs text-white/55">
            <Pill>{selectedModel.label}</Pill>
            <Pill>{selectedAspectRatio}</Pill>
            <Pill className="capitalize">{qualityMode}</Pill>
            <Pill>{imageCost} credits</Pill>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
            <Button
              type="button"
              onClick={() => onChangeMode?.("image")}
              className="h-10 rounded-2xl bg-white text-black hover:bg-white/90"
            >
              Image
            </Button>
            <Button
              type="button"
              onClick={() => onChangeMode?.("video")}
              variant="outline"
              className="h-10 rounded-2xl border-white/10 bg-white/5 text-white"
            >
              Video
            </Button>
          </div>
        </Panel>

        <Panel>
          <SectionTitle icon={Wand2} title="Prompt" subtitle="Write the image you want." />
          <textarea
            rows={7}
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="Describe your image..."
            className="mt-4 min-h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#0b0e10] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button type="button" onClick={onClearPrompt} className="text-xs text-white/50">
              Clear prompt
            </button>
            <label className="flex items-center gap-2 text-xs text-white/55">
              Auto polish
              <Toggle checked={promptBoost} onChange={onPromptBoostChange} />
            </label>
          </div>
        </Panel>

        <details className="group" open>
          <Summary icon={Sparkles} title="Model And Output" />
          <Panel className="mt-3 space-y-5">
            <div className="grid gap-2">
              {imageModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => onModelChange(model.id)}
                  className={cn(
                    "rounded-2xl border p-3 text-left",
                    selectedModelId === model.id
                      ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10"
                      : "border-white/10 bg-white/5"
                  )}
                >
                  <span className="block text-sm font-semibold text-white">{model.label}</span>
                  <span className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{model.description}</span>
                </button>
              ))}
            </div>

            <ChoiceWrap title="Style">
              {imageStyles.map((style) => (
                <Chip key={style} active={selectedStyle === style} onClick={() => onStyleChange(style)}>
                  {style}
                </Chip>
              ))}
            </ChoiceWrap>

            <ChoiceWrap title="Aspect ratio">
              {aspectRatios.map((ratio) => (
                <Chip key={ratio.value} active={selectedAspectRatio === ratio.value} onClick={() => onAspectRatioChange(ratio.value)}>
                  {ratio.label}
                </Chip>
              ))}
            </ChoiceWrap>

            <ChoiceWrap title="Quality">
              {qualityModes.map((mode) => (
                <Chip key={mode.value} active={qualityMode === mode.value} onClick={() => onQualityModeChange(mode.value)}>
                  {mode.label}
                </Chip>
              ))}
            </ChoiceWrap>
          </Panel>
        </details>

        <details className="group">
          <Summary icon={Layers3} title="Reference And Avoids" />
          <Panel className="mt-3 space-y-4">
            {supportsReferenceImage ? (
              <div>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[#0b0e10] p-3">
                  <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/8">
                    {referenceImageUrl ? (
                      <Image src={referenceImageUrl} alt="Reference" fill sizes="56px" className="object-cover" />
                    ) : uploadingReferenceImage ? (
                      <Loader2 className="size-5 animate-spin text-white/60" />
                    ) : (
                      <Upload className="size-5 text-white/60" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {referenceImageName || "Upload reference"}
                    </span>
                    <span className="text-xs text-white/45">PNG, JPG, WEBP</span>
                  </span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => void onReferenceImageUpload(event)} />
                </label>
                {referenceImageUrl ? (
                  <button type="button" onClick={onRemoveReferenceImage} className="mt-2 inline-flex items-center gap-2 text-xs text-white/55">
                    <X className="size-3" />
                    Remove reference
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/45">
                {selectedModel.label} is prompt-only. Switch models to use references.
              </p>
            )}

            <textarea
              rows={4}
              value={negativePrompt}
              onChange={(event) => onNegativePromptChange(event.target.value)}
              placeholder="Things to avoid..."
              className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-[#0b0e10] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
            />
          </Panel>
        </details>

        <details className="group">
          <Summary icon={Settings2} title="Advanced" />
          <Panel className="mt-3 space-y-4">
            <button type="button" onClick={onToggleAdvancedOpen} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white">
              {advancedOpen ? "Hide advanced controls" : "Show advanced controls"}
            </button>
            {advancedOpen ? (
              <>
                {supportsSeed ? (
                  <input
                    value={seed}
                    onChange={(event) => onSeedChange(event.target.value)}
                    placeholder="Seed"
                    inputMode="numeric"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b0e10] px-4 text-sm text-white outline-none placeholder:text-white/30"
                  />
                ) : null}
                {supportsSteps ? <Slider label="Steps" value={steps} min={10} max={50} step={1} onChange={onStepsChange} /> : null}
                {supportsGuidance ? <Slider label="Guidance" value={guidance} min={1} max={20} step={0.5} onChange={onGuidanceChange} display={guidance.toFixed(1)} /> : null}
                {!supportsSeed && !supportsSteps && !supportsGuidance ? (
                  <p className="text-xs leading-5 text-white/45">This model manages seed, steps, and guidance automatically.</p>
                ) : null}
              </>
            ) : null}
          </Panel>
        </details>

        <details className="group">
          <Summary icon={Sparkles} title="Assist" />
          <Panel className="mt-3 space-y-4">
            <div className="grid gap-2">
              {promptStarters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => onSuggestionSelect(starter)}
                  className={cn(
                    "rounded-2xl border p-3 text-left text-xs leading-5",
                    selectedSuggestion === starter ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-white" : "border-white/10 bg-white/5 text-white/55"
                  )}
                >
                  {starter}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button disabled={!selectedSuggestion} onClick={() => selectedSuggestion && onPromptChange(selectedSuggestion)} className="rounded-xl bg-white text-black hover:bg-white/90">
                Replace
              </Button>
              <Button
                disabled={!selectedSuggestion}
                onClick={() => selectedSuggestion && onPromptChange(prompt.trim() ? `${prompt.trim()}, ${selectedSuggestion}` : selectedSuggestion)}
                className="rounded-xl bg-white/10 text-white hover:bg-white/15"
              >
                Append
              </Button>
            </div>
            <PromptTemplatesPanel type="image" onUseTemplate={(template) => {
              onPromptChange(template.prompt);
              onNegativePromptChange(template.negativePrompt ?? "");
            }} />
          </Panel>
        </details>

        <details className="group">
          <Summary icon={Save} title="Drafts" />
          <Panel className="mt-3 space-y-4">
            <div className="flex gap-2">
              <input
                value={draftTitle}
                onChange={(event) => onDraftTitleChange(event.target.value)}
                placeholder="Draft title"
                className="h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0b0e10] px-4 text-sm text-white outline-none placeholder:text-white/30"
              />
              <Button disabled={savingDraft} onClick={() => void onSaveDraft()} className="rounded-2xl bg-white px-4 text-black hover:bg-white/90">
                {savingDraft ? "Saving" : "Save"}
              </Button>
            </div>
            <DraftList drafts={drafts} activeDraftId={activeDraftId} deletingDraftId={deletingDraftId} onLoadDraft={onLoadDraft} onDeleteDraft={onDeleteDraft} />
          </Panel>
        </details>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#090b0d]/95 p-3 backdrop-blur">
        <div className="flex gap-2">
          <Button
            onClick={() => void onGenerate()}
            disabled={!canGenerate}
            className="h-12 flex-1 rounded-2xl bg-[#2dd4bf] font-semibold text-black hover:bg-[#5eead4]"
          >
            {loading ? "Generating..." : `Generate · ${imageCost}`}
          </Button>
          <Button
            variant="outline"
            disabled={!canGenerateVariation}
            onClick={() => void onGenerateVariation()}
            className="h-12 rounded-2xl border-white/10 bg-white/5 px-4 text-white"
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            variant="outline"
            onClick={onResetSession}
            className="h-12 rounded-2xl border-white/10 bg-white/5 px-4 text-white"
          >
            Reset
          </Button>
        </div>
      </div>
    </section>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl border border-white/10 bg-[#111519] p-4", className)}>{children}</div>;
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#2dd4bf]">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-white/45">{subtitle}</span>
      </span>
    </div>
  );
}

function Summary({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <summary className="flex cursor-pointer list-none items-center justify-between rounded-3xl border border-white/10 bg-[#111519] px-4 py-3 text-sm font-semibold text-white">
      <span className="flex items-center gap-3">
        <Icon className="size-4 text-[#2dd4bf]" />
        {title}
      </span>
      <ChevronDown className="size-4 text-white/45 transition group-open:rotate-180" />
    </summary>
  );
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("rounded-full border border-white/10 bg-white/5 px-2.5 py-1", className)}>{children}</span>;
}

function ChoiceWrap({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium",
        active ? "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#b7fff5]" : "border-white/10 bg-white/5 text-white/55"
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 rounded-full", checked ? "bg-[#2dd4bf]" : "bg-white/15")}>
      <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", checked ? "left-6" : "left-1")} />
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
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{label}</span>
        <span>{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-[#2dd4bf]" />
    </div>
  );
}

function DraftList({
  drafts,
  activeDraftId,
  deletingDraftId,
  onLoadDraft,
  onDeleteDraft,
}: {
  drafts: Draft[];
  activeDraftId: string | null;
  deletingDraftId: string | null;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => Promise<void>;
}) {
  if (!drafts.length) {
    return <p className="rounded-2xl border border-white/10 bg-[#0b0e10] p-4 text-sm text-white/45">No drafts yet.</p>;
  }

  return (
    <div className="grid gap-2">
      {drafts.map((draft) => (
        <div key={draft.id} className={cn("rounded-2xl border p-3", activeDraftId === draft.id ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10" : "border-white/10 bg-white/5")}>
          <button type="button" onClick={() => onLoadDraft(draft)} className="block w-full text-left">
            <span className="block truncate text-sm font-semibold text-white">{draft.title}</span>
            <span className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{draft.prompt}</span>
          </button>
          <button type="button" disabled={deletingDraftId === draft.id} onClick={() => void onDeleteDraft(draft.id)} className="mt-2 text-xs text-white/45">
            {deletingDraftId === draft.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}
