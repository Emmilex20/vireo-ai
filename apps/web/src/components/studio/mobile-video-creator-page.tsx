"use client";

import { type ChangeEvent, type ReactNode } from "react";
import {
  ChevronDown,
  Clapperboard,
  Film,
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
  listReplicateVideoModels,
  type ReplicateVideoModelConfig,
  type ReplicateVideoModelId,
} from "@/lib/ai/providers/replicate-video-models";
import {
  cameraMoves,
  motionIntensityOptions,
  styleStrengthOptions,
  videoAspectRatios,
  videoDurations,
  videoFpsOptions,
  videoPromptSuggestions,
  videoResolutionOptions,
  videoShotTypes,
} from "@/lib/video-studio-data";
import { cn } from "@/lib/utils";
import type { StudioMode } from "./studio-mode-config";

type VideoDraft = {
  id: string;
  title: string;
  modelId?: string | null;
  prompt: string;
  negativePrompt?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  resolution?: string | null;
  draftMode?: boolean | null;
  saveAudio?: boolean | null;
  promptUpsampling?: boolean | null;
  disableSafetyFilter?: boolean | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  imageUrl?: string | null;
  sourceAssetId?: string | null;
  updatedAt: string;
};

type Props = {
  onChangeMode?: (mode: StudioMode) => void;
  selectedModelId: ReplicateVideoModelId;
  selectedModel: ReplicateVideoModelConfig;
  onModelChange: (value: ReplicateVideoModelId) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  imageUrl: string;
  sourceImageName: string;
  uploadingSourceImage: boolean;
  onSourceImageUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveSourceImage: () => void;
  endImageUrl: string;
  endImageName: string;
  uploadingEndImage: boolean;
  onEndImageUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveEndImage: () => void;
  referenceImageUrls: string[];
  referenceImageNames: string[];
  uploadingReferenceImage: boolean;
  onReferenceImageUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveReferenceImage: (index: number) => void;
  audioUrl: string;
  audioName: string;
  uploadingAudio: boolean;
  onAudioUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveAudio: () => void;
  duration: string;
  onDurationChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  motionIntensity: string;
  onMotionIntensityChange: (value: string) => void;
  cameraMove: string;
  onCameraMoveChange: (value: string) => void;
  videoCost: number;
  videoUrl: string | null;
  loading: boolean;
  canGenerate: boolean;
  onGenerate: () => Promise<void>;
  canGenerateAnotherTake: boolean;
  onGenerateAnotherTake: () => Promise<void>;
  draftTitle: string;
  onDraftTitleChange: (value: string) => void;
  savingDraft: boolean;
  onSaveDraft: () => Promise<void>;
  drafts: VideoDraft[];
  activeDraftId: string | null;
  deletingDraftId: string | null;
  onLoadDraft: (draft: VideoDraft) => void;
  onDeleteDraft: (draftId: string) => Promise<void>;
  selectedSuggestion: string | null;
  onSuggestionSelect: (value: string) => void;
  onReplacePrompt: () => void;
  onAppendPrompt: () => void;
  advancedOpen: boolean;
  onToggleAdvancedOpen: () => void;
  resolution: string;
  onResolutionChange: (value: string) => void;
  draftMode: boolean;
  onDraftModeChange: (value: boolean) => void;
  saveAudio: boolean;
  onSaveAudioChange: (value: boolean) => void;
  promptUpsampling: boolean;
  onPromptUpsamplingChange: (value: boolean) => void;
  disableSafetyFilter: boolean;
  onDisableSafetyFilterChange: (value: boolean) => void;
  styleStrength: string;
  onStyleStrengthChange: (value: string) => void;
  motionGuidance: number;
  onMotionGuidanceChange: (value: number) => void;
  shotType: string;
  onShotTypeChange: (value: string) => void;
  fps: string;
  onFpsChange: (value: string) => void;
  takeCount: number;
  activeDraftTitle: string | null;
  hasPersistedSession: boolean;
  lastAction: string | null;
  onResetSession: () => void;
};

export function MobileVideoCreatorPage({
  onChangeMode,
  selectedModelId,
  selectedModel,
  onModelChange,
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  imageUrl,
  sourceImageName,
  uploadingSourceImage,
  onSourceImageUpload,
  onRemoveSourceImage,
  endImageUrl,
  endImageName,
  uploadingEndImage,
  onEndImageUpload,
  onRemoveEndImage,
  referenceImageUrls,
  referenceImageNames,
  uploadingReferenceImage,
  onReferenceImageUpload,
  onRemoveReferenceImage,
  audioUrl,
  audioName,
  uploadingAudio,
  onAudioUpload,
  onRemoveAudio,
  duration,
  onDurationChange,
  aspectRatio,
  onAspectRatioChange,
  motionIntensity,
  onMotionIntensityChange,
  cameraMove,
  onCameraMoveChange,
  videoCost,
  videoUrl,
  loading,
  canGenerate,
  onGenerate,
  canGenerateAnotherTake,
  onGenerateAnotherTake,
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
  onReplacePrompt,
  onAppendPrompt,
  advancedOpen,
  onToggleAdvancedOpen,
  resolution,
  onResolutionChange,
  draftMode,
  onDraftModeChange,
  saveAudio,
  onSaveAudioChange,
  promptUpsampling,
  onPromptUpsamplingChange,
  disableSafetyFilter,
  onDisableSafetyFilterChange,
  styleStrength,
  onStyleStrengthChange,
  motionGuidance,
  onMotionGuidanceChange,
  shotType,
  onShotTypeChange,
  fps,
  onFpsChange,
  takeCount,
  activeDraftTitle,
  hasPersistedSession,
  lastAction,
  onResetSession,
}: Props) {
  const videoModels = listReplicateVideoModels();
  const supportsEndFrame = selectedModel.features.includes("Start/End");
  const supportsReferences = selectedModel.features.includes("Reference");
  const supportsMultiShot = selectedModel.features.includes("Multi-shots");

  return (
    <section className="lg:hidden">
      <div className="space-y-4 pb-28">
        <Panel className="overflow-hidden p-0">
          <div className="relative flex aspect-video items-center justify-center bg-[#0b0e10]">
            {videoUrl ? (
              <video src={videoUrl} controls className="h-full w-full object-contain" />
            ) : (
              <div className="px-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  {loading ? <Loader2 className="size-6 animate-spin text-[#2dd4bf]" /> : <Clapperboard className="size-6 text-white/60" />}
                </div>
                <p className="mt-4 text-sm font-medium text-white">
                  {loading ? "Generating your video" : "Your video appears here"}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/45">Completed clips are saved to Assets.</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-3 text-xs text-white/55">
            <Pill>{selectedModel.label}</Pill>
            <Pill>{duration}s</Pill>
            <Pill>{aspectRatio}</Pill>
            <Pill>{videoCost} credits</Pill>
            {takeCount > 0 ? <Pill>Take {takeCount}</Pill> : null}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
            <Button
              type="button"
              onClick={() => onChangeMode?.("image")}
              variant="outline"
              className="h-10 rounded-2xl border-white/10 bg-white/5 text-white"
            >
              Image
            </Button>
            <Button
              type="button"
              onClick={() => onChangeMode?.("video")}
              className="h-10 rounded-2xl bg-white text-black hover:bg-white/90"
            >
              Video
            </Button>
          </div>
        </Panel>

        <Panel>
          <SectionTitle icon={Wand2} title="Scene Prompt" subtitle="Describe the shot, movement, mood, and camera." />
          <textarea
            rows={7}
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="A cinematic scene of..."
            className="mt-4 min-h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#0b0e10] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
          />
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/45">
            <span>{selectedModel.badge}</span>
            {activeDraftTitle ? <span className="truncate">Draft: {activeDraftTitle}</span> : hasPersistedSession ? <span>Session saved</span> : null}
          </div>
        </Panel>

        <details className="group" open>
          <Summary icon={Sparkles} title="Model And Format" />
          <Panel className="mt-3 space-y-5">
            <div className="grid gap-2">
              {videoModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => onModelChange(model.id)}
                  className={cn(
                    "rounded-2xl border p-3 text-left",
                    selectedModelId === model.id ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10" : "border-white/10 bg-white/5"
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{model.label}</span>
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-white/50">{model.badge}</span>
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{model.description}</span>
                </button>
              ))}
            </div>

            <ChoiceWrap title="Duration">
              {videoDurations.map((item) => <Chip key={item.value} active={duration === item.value} onClick={() => onDurationChange(item.value)}>{item.label}</Chip>)}
            </ChoiceWrap>
            <ChoiceWrap title="Aspect ratio">
              {videoAspectRatios.map((item) => <Chip key={item.value} active={aspectRatio === item.value} onClick={() => onAspectRatioChange(item.value)}>{item.label}</Chip>)}
            </ChoiceWrap>
          </Panel>
        </details>

        <details className="group">
          <Summary icon={Film} title="Motion" />
          <Panel className="mt-3 space-y-5">
            <ChoiceWrap title="Motion intensity">
              {motionIntensityOptions.map((item) => <Chip key={item.value} active={motionIntensity === item.value} onClick={() => onMotionIntensityChange(item.value)}>{item.label}</Chip>)}
            </ChoiceWrap>
            <ChoiceWrap title="Camera move">
              {cameraMoves.map((item) => <Chip key={item} active={cameraMove === item} onClick={() => onCameraMoveChange(item)}>{item}</Chip>)}
            </ChoiceWrap>
          </Panel>
        </details>

        <details className="group">
          <Summary icon={Layers3} title="Frames, References, Avoids" />
          <Panel className="mt-3 space-y-4">
            {selectedModel.supports.imageInput ? (
              <>
                <MobileFrameUpload
                  label={supportsEndFrame ? "Start frame" : "Source frame"}
                  imageUrl={imageUrl}
                  imageName={sourceImageName}
                  uploading={uploadingSourceImage}
                  onUpload={onSourceImageUpload}
                  onRemove={onRemoveSourceImage}
                />
                {supportsEndFrame ? (
                  <MobileFrameUpload
                    label="End frame"
                    imageUrl={endImageUrl}
                    imageName={endImageName}
                    uploading={uploadingEndImage}
                    onUpload={onEndImageUpload}
                    onRemove={onRemoveEndImage}
                  />
                ) : null}
                {supportsReferences || supportsMultiShot ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0b0e10] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {supportsMultiShot ? "Multi-shot references" : "Reference images"}
                        </p>
                        <p className="text-xs text-white/45">Up to 4 images</p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs text-white">
                        {uploadingReferenceImage ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                        Add
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => void onReferenceImageUpload(event)} disabled={referenceImageUrls.length >= 4} />
                      </label>
                    </div>
                    {referenceImageUrls.length ? (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {referenceImageUrls.map((url, index) => (
                          <button
                            key={`${url}-${index}`}
                            type="button"
                            onClick={() => onRemoveReferenceImage(index)}
                            className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            aria-label="Remove reference image"
                          >
                            <img src={url} alt={referenceImageNames[index] || `Reference ${index + 1}`} className="size-full object-cover" />
                            <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70">
                              <X className="size-3" />
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {selectedModel.supports.audioGeneration ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0b0e10] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">Audio</p>
                        <p className="text-xs text-white/45">Generate or guide sound</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSaveAudioChange(!saveAudio)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs",
                          saveAudio
                            ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#b7fff5]"
                            : "border-white/10 bg-white/5 text-white/55"
                        )}
                      >
                        {saveAudio ? "On" : "Off"}
                      </button>
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/4 p-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/8">
                        {uploadingAudio ? <Loader2 className="size-4 animate-spin text-white/60" /> : <Film className="size-4 text-white/60" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{audioName || "Upload audio reference"}</span>
                        <span className="text-xs text-white/45">MP3, WAV, M4A, OGG</span>
                      </span>
                      <input type="file" accept="audio/*" className="hidden" onChange={(event) => void onAudioUpload(event)} />
                    </label>
                    {audioUrl ? (
                      <div className="mt-3 space-y-2">
                        <audio src={audioUrl} controls className="h-9 w-full" />
                        <button type="button" onClick={onRemoveAudio} className="inline-flex items-center gap-2 text-xs text-white/55">
                          <X className="size-3" />
                          Remove audio
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/45">This model is prompt-only in the current setup.</p>
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
                {selectedModel.supports.resolutionControl ? <ChoiceWrap title="Resolution">{videoResolutionOptions.map((item) => <Chip key={item.value} active={resolution === item.value} onClick={() => onResolutionChange(item.value)}>{item.label}</Chip>)}</ChoiceWrap> : null}
                {selectedModel.supports.fpsControl ? <ChoiceWrap title="Frame rate">{videoFpsOptions.map((item) => <Chip key={item.value} active={fps === item.value} onClick={() => onFpsChange(item.value)}>{item.label}</Chip>)}</ChoiceWrap> : null}
                {selectedModel.supports.styleStrength ? <ChoiceWrap title="Style strength">{styleStrengthOptions.map((item) => <Chip key={item.value} active={styleStrength === item.value} onClick={() => onStyleStrengthChange(item.value)}>{item.label}</Chip>)}</ChoiceWrap> : null}
                {selectedModel.supports.shotType ? <ChoiceWrap title="Shot type">{videoShotTypes.map((item) => <Chip key={item} active={shotType === item} onClick={() => onShotTypeChange(item)}>{item}</Chip>)}</ChoiceWrap> : null}
                {selectedModel.supports.motionGuidance ? <Slider label="Motion guidance" value={motionGuidance} min={1} max={10} step={1} onChange={onMotionGuidanceChange} /> : null}
                {selectedModel.supports.draftMode ? (
                  <div className="grid gap-2">
                    <ToggleRow label="Draft mode" checked={draftMode} onChange={onDraftModeChange} />
                    <ToggleRow label="Prompt upsampling" checked={promptUpsampling} onChange={onPromptUpsamplingChange} />
                    <ToggleRow label="Relax safety filter" checked={disableSafetyFilter} onChange={onDisableSafetyFilterChange} />
                  </div>
                ) : null}
              </>
            ) : null}
          </Panel>
        </details>

        <details className="group">
          <Summary icon={Sparkles} title="Assist" />
          <Panel className="mt-3 space-y-4">
            <div className="grid gap-2">
              {videoPromptSuggestions.map((starter) => (
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
              <Button disabled={!selectedSuggestion} onClick={onReplacePrompt} className="rounded-xl bg-white text-black hover:bg-white/90">Replace</Button>
              <Button disabled={!selectedSuggestion} onClick={onAppendPrompt} className="rounded-xl bg-white/10 text-white hover:bg-white/15">Append</Button>
            </div>
            <PromptTemplatesPanel type="video" onUseTemplate={(template) => {
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
          <Button onClick={() => void onGenerate()} disabled={!canGenerate} className="h-12 flex-1 rounded-2xl bg-[#2dd4bf] font-semibold text-black hover:bg-[#5eead4]">
            {loading ? "Generating..." : `Generate · ${videoCost}`}
          </Button>
          <Button variant="outline" disabled={!canGenerateAnotherTake} onClick={() => void onGenerateAnotherTake()} className="h-12 rounded-2xl border-white/10 bg-white/5 px-4 text-white">
            <RotateCcw className="size-4" />
          </Button>
          <Button variant="outline" onClick={onResetSession} className="h-12 rounded-2xl border-white/10 bg-white/5 px-4 text-white">
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

function MobileFrameUpload({
  label,
  imageUrl,
  imageName,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  imageUrl: string;
  imageName: string;
  uploading: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemove: () => void;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[#0b0e10] p-3">
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/8">
          {imageUrl ? (
            <img src={imageUrl} alt={label} className="size-full object-cover" />
          ) : uploading ? (
            <Loader2 className="size-5 animate-spin text-white/60" />
          ) : (
            <Upload className="size-5 text-white/60" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-white">
            {imageName || `Upload ${label.toLowerCase()}`}
          </span>
          <span className="text-xs text-white/45">PNG, JPG, WEBP</span>
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => void onUpload(event)}
        />
      </label>
      {imageUrl ? (
        <button type="button" onClick={onRemove} className="mt-2 inline-flex items-center gap-2 text-xs text-white/55">
          <X className="size-3" />
          Remove {label.toLowerCase()}
        </button>
      ) : null}
    </div>
  );
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

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{children}</span>;
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
    <button type="button" onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", active ? "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#b7fff5]" : "border-white/10 bg-white/5 text-white/55")}>
      {children}
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e10] px-4 py-3 text-sm text-white/70">
      <span>{label}</span>
      <span className={cn("relative h-6 w-11 rounded-full", checked ? "bg-[#2dd4bf]" : "bg-white/15")}>
        <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", checked ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-[#2dd4bf]" />
    </div>
  );
}

function DraftList({ drafts, activeDraftId, deletingDraftId, onLoadDraft, onDeleteDraft }: { drafts: VideoDraft[]; activeDraftId: string | null; deletingDraftId: string | null; onLoadDraft: (draft: VideoDraft) => void; onDeleteDraft: (draftId: string) => Promise<void> }) {
  if (!drafts.length) {
    return <p className="rounded-2xl border border-white/10 bg-[#0b0e10] p-4 text-sm text-white/45">No video drafts yet.</p>;
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
