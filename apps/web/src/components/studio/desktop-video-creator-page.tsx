"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Download,
  Film,
  FolderOpen,
  Gift,
  Globe2,
  Grid2x2,
  HelpCircle,
  History,
  Home,
  ImageIcon,
  Layers3,
  Lightbulb,
  Loader2,
  Move3d,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Upload,
  Users,
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
import { StudioHomeSidebar } from "./studio-home-sidebar";

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

type DesktopVideoCreatorPageProps = {
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

type SidebarItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
};

const primaryNav: SidebarItem[] = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "image", label: "Image Studio", href: "/studio", icon: ImageIcon },
  { key: "video", label: "Video Studio", href: "/studio", icon: Clapperboard, active: true },
  { key: "assets", label: "Assets", href: "/assets", icon: FolderOpen },
  { key: "explore", label: "Explore", href: "/explore", icon: Globe2 },
  { key: "creators", label: "Creators", href: "/creators", icon: Users },
];

const quickTools: SidebarItem[] = [
  { key: "templates", label: "Templates", href: "/templates", icon: Grid2x2 },
  { key: "inspiration", label: "Inspiration", href: "/explore", icon: Lightbulb },
  { key: "guides", label: "Guides", href: "/pricing", icon: BookOpen },
];

export function DesktopVideoCreatorPage({
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
}: DesktopVideoCreatorPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState<"assist" | "drafts" | "settings">("assist");
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const videoModels = listReplicateVideoModels();
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const hasResult = Boolean(videoUrl);
  const activeDraftName = useMemo(
    () => activeDraftTitle ?? drafts.find((draft) => draft.id === activeDraftId)?.title,
    [activeDraftId, activeDraftTitle, drafts]
  );
  const supportsEndFrame = selectedModel.features.includes("Start/End");
  const supportsReferences = selectedModel.features.includes("Reference");
  const supportsMultiShot = selectedModel.features.includes("Multi-shots");

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
              <span className="text-white/80">Video Studio</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-base font-semibold tracking-tight">Generate Video</h1>
              {activeDraftName ? (
                <span className="rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 px-2.5 py-1 text-xs text-[#9ff5e8]">
                  Draft: {activeDraftName}
                </span>
              ) : null}
              {hasPersistedSession ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/45">
                  Session saved
                </span>
              ) : null}
              {lastAction ? <span className="max-w-md truncate text-xs text-white/45">{lastAction}</span> : null}
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
                <PanelHeader icon={Sparkles} title="Model" description={selectedModel.description} />
                <button
                  type="button"
                  onClick={() => setModelPickerOpen(true)}
                  className="mt-4 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-[#2dd4bf]/35 hover:bg-white/8"
                >
                  <ModelGlyph model={selectedModel} />
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
                  <PanelHeader icon={Wand2} title="Scene Prompt" description="Define subject, movement, lighting, camera, and mood." />
                  <button
                    type="button"
                    onClick={() => onPromptChange("")}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={prompt}
                  onChange={(event) => onPromptChange(event.target.value)}
                  placeholder="A cinematic tracking shot of..."
                  className="mt-3 min-h-36 w-full resize-none rounded-xl border border-white/10 bg-[#0b0e10] px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf]/40"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-white/45">
                  <span>{wordCount} words</span>
                  <span>{selectedModel.label}</span>
                </div>
              </Panel>

              <Panel>
                <PanelHeader
                  icon={Layers3}
                  title="Frames And References"
                  description={
                    selectedModel.supports.imageInput
                      ? "Attach the frames and references this model can use."
                      : "This model is prompt-only in this studio."
                  }
                />
                {selectedModel.supports.imageInput ? (
                  <div className="mt-4 space-y-3">
                    <FrameUpload
                      label={supportsEndFrame ? "Start frame" : "Source frame"}
                      helper="First image used to establish subject and composition."
                      imageUrl={imageUrl}
                      imageName={sourceImageName}
                      uploading={uploadingSourceImage}
                      onUpload={onSourceImageUpload}
                      onRemove={onRemoveSourceImage}
                    />

                    {supportsEndFrame ? (
                      <FrameUpload
                        label="End frame"
                        helper="Optional final frame for start/end animation models."
                        imageUrl={endImageUrl}
                        imageName={endImageName}
                        uploading={uploadingEndImage}
                        onUpload={onEndImageUpload}
                        onRemove={onRemoveEndImage}
                      />
                    ) : null}

                    {supportsReferences || supportsMultiShot ? (
                      <div className="rounded-xl border border-white/10 bg-[#0b0e10] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {supportsMultiShot ? "Multi-shot references" : "Reference images"}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-white/45">
                              Add up to 4 visual references for identity, style, or shot continuity.
                            </p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white">
                            {uploadingReferenceImage ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Upload className="size-3.5" />
                            )}
                            Add
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(event) => void onReferenceImageUpload(event)}
                              disabled={referenceImageUrls.length >= 4}
                            />
                          </label>
                        </div>

                        {referenceImageUrls.length ? (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {referenceImageUrls.map((url, index) => (
                              <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
                                <img src={url} alt={referenceImageNames[index] || `Reference ${index + 1}`} className="h-20 w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => onRemoveReferenceImage(index)}
                                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                                  aria-label="Remove reference image"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {selectedModel.supports.audioGeneration ? (
                      <AudioUpload
                        saveAudio={saveAudio}
                        onSaveAudioChange={onSaveAudioChange}
                        audioUrl={audioUrl}
                        audioName={audioName}
                        uploadingAudio={uploadingAudio}
                        onAudioUpload={onAudioUpload}
                        onRemoveAudio={onRemoveAudio}
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/50">
                    Switch to a model with image input to use a starting frame.
                  </div>
                )}
              </Panel>

              <Panel>
                <PanelHeader icon={Film} title="Motion And Format" description="Set length, frame, motion energy, and camera behavior." />
                <div className="mt-4 space-y-4">
                  <ChoiceGrid label="Duration" items={videoDurations} value={duration} onChange={onDurationChange} columns="grid-cols-4" />
                  <ChoiceGrid label="Aspect ratio" items={videoAspectRatios} value={aspectRatio} onChange={onAspectRatioChange} columns="grid-cols-3" />
                  <ChoiceGrid label="Motion" items={motionIntensityOptions} value={motionIntensity} onChange={onMotionIntensityChange} columns="grid-cols-3" />
                  <div>
                    <Label>Camera move</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cameraMoves.map((move) => (
                        <Chip key={move} active={cameraMove === move} onClick={() => onCameraMoveChange(move)}>
                          {move}
                        </Chip>
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
                <Clapperboard className="size-4 text-[#2dd4bf]" />
                Preview
              </div>
              <div className="flex items-center gap-2 text-xs text-white/45">
                <Pill>{selectedModel.label}</Pill>
                <Pill>{duration}s</Pill>
                <Pill>{aspectRatio}</Pill>
                {takeCount > 0 ? <Pill>Take {takeCount}</Pill> : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 p-3">
              <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,#10161a,#090b0d_55%,#14110f)]">
                {videoUrl ? (
                  <video src={videoUrl} controls className="h-full w-full object-contain" />
                ) : (
                  <div className="mx-auto max-w-md px-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      {loading ? (
                        <Loader2 className="size-7 animate-spin text-[#2dd4bf]" />
                      ) : (
                        <Clapperboard className="size-7 text-white/65" />
                      )}
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">
                      {loading ? "Generating your video" : "Your video appears here"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      {loading
                        ? "The scene is rendering. You can prepare the next take while it completes."
                        : "Write a scene prompt, choose motion, and generate. Finished clips are saved to Assets."}
                    </p>
                  </div>
                )}
                {loading ? (
                  <div className="absolute inset-x-6 bottom-6 rounded-xl border border-[#2dd4bf]/25 bg-[#061817]/90 p-3 text-sm text-[#b7fff5] backdrop-blur">
                    Video generation in progress
                  </div>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#0d1012] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 min-w-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold">
                  {videoCost} credits
                </div>
                <Button
                  onClick={() => void onGenerate()}
                  disabled={!canGenerate}
                  className="h-10 flex-1 rounded-xl bg-[#2dd4bf] text-sm font-semibold text-black hover:bg-[#5eead4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate video"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onGenerateAnotherTake()}
                  disabled={!canGenerateAnotherTake}
                  className="h-10 rounded-xl border-white/10 bg-white/5 px-3 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <RotateCcw className="mr-2 size-4" />
                  Another take
                </Button>
                {hasResult ? (
                  <a
                    href={videoUrl ?? undefined}
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
                  onReplace={onReplacePrompt}
                  onAppend={onAppendPrompt}
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
                  selectedModel={selectedModel}
                  advancedOpen={advancedOpen}
                  onToggleAdvancedOpen={onToggleAdvancedOpen}
                  negativePrompt={negativePrompt}
                  onNegativePromptChange={onNegativePromptChange}
                  resolution={resolution}
                  onResolutionChange={onResolutionChange}
                  draftMode={draftMode}
                  onDraftModeChange={onDraftModeChange}
                  saveAudio={saveAudio}
                  onSaveAudioChange={onSaveAudioChange}
                  promptUpsampling={promptUpsampling}
                  onPromptUpsamplingChange={onPromptUpsamplingChange}
                  disableSafetyFilter={disableSafetyFilter}
                  onDisableSafetyFilterChange={onDisableSafetyFilterChange}
                  styleStrength={styleStrength}
                  onStyleStrengthChange={onStyleStrengthChange}
                  motionGuidance={motionGuidance}
                  onMotionGuidanceChange={onMotionGuidanceChange}
                  shotType={shotType}
                  onShotTypeChange={onShotTypeChange}
                  fps={fps}
                  onFpsChange={onFpsChange}
                />
              ) : null}
            </div>
          </section>
        </div>
      </main>

      {modelPickerOpen ? (
        <VideoModelPickerModal
          models={videoModels}
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

function SidebarGroup({
  title,
  items,
  open,
  onChangeMode,
}: {
  title?: string;
  items: SidebarItem[];
  open: boolean;
  onChangeMode?: (mode: StudioMode) => void;
}) {
  return (
    <div>
      {title && open ? (
        <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/30">
          {title}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const mode = item.key === "image" || item.key === "video" ? item.key : null;
          const className = cn(
            "flex h-11 items-center rounded-xl border transition",
            open ? "gap-3 px-3" : "justify-center px-0",
            item.active
              ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/10 text-white"
              : "border-transparent text-white/55 hover:border-white/10 hover:bg-white/5 hover:text-white"
          );

          if (mode && onChangeMode) {
            return (
              <button
                key={item.key}
                type="button"
                title={open ? undefined : item.label}
                onClick={() => onChangeMode(mode)}
                className={className}
              >
                <Icon className="size-4 shrink-0" />
                {open ? <span className="truncate text-sm font-medium">{item.label}</span> : null}
              </button>
            );
          }

          return (
            <Link key={item.key} href={item.href} title={open ? undefined : item.label} className={className}>
              <Icon className="size-4 shrink-0" />
              {open ? <span className="truncate text-sm font-medium">{item.label}</span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AssistPanel({
  selectedSuggestion,
  onSelect,
  onReplace,
  onAppend,
  onUseTemplate,
}: {
  selectedSuggestion: string | null;
  onSelect: (value: string) => void;
  onReplace: () => void;
  onAppend: () => void;
  onUseTemplate: (template: { prompt: string; negativePrompt?: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader icon={Lightbulb} title="Prompt Starters" description="Use or append a cinematic direction." />
        <div className="mt-4 space-y-2">
          {videoPromptSuggestions.map((starter) => (
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
            onClick={onReplace}
            className="h-9 rounded-lg border border-white/10 bg-white/5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-40"
          >
            Replace
          </button>
          <button
            type="button"
            disabled={!selectedSuggestion}
            onClick={onAppend}
            className="h-9 rounded-lg border border-white/10 bg-white/5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-40"
          >
            Append
          </button>
        </div>
      </Panel>
      <div className="[&>div]:rounded-xl [&>div]:border-white/10 [&>div]:bg-white/5">
        <PromptTemplatesPanel type="video" onUseTemplate={onUseTemplate} />
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
  drafts: VideoDraft[];
  activeDraftId: string | null;
  deletingDraftId: string | null;
  draftTitle: string;
  savingDraft: boolean;
  onDraftTitleChange: (value: string) => void;
  onSaveDraft: () => Promise<void>;
  onLoadDraft: (draft: VideoDraft) => void;
  onDeleteDraft: (draftId: string) => Promise<void>;
  onResetSession: () => void;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader icon={Save} title="Save Setup" description="Store this cinematic configuration." />
        <input
          value={draftTitle}
          onChange={(event) => onDraftTitleChange(event.target.value)}
          placeholder="Video draft title"
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
                <button type="button" onClick={() => onLoadDraft(draft)} className="block w-full text-left">
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
              Saved video drafts will appear here.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function SettingsPanel({
  selectedModel,
  advancedOpen,
  onToggleAdvancedOpen,
  negativePrompt,
  onNegativePromptChange,
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
}: {
  selectedModel: ReplicateVideoModelConfig;
  advancedOpen: boolean;
  onToggleAdvancedOpen: () => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
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
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <PanelHeader icon={Settings2} title="Advanced" description={selectedModel.label} />
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

            {selectedModel.supports.resolutionControl ? (
              <ChoiceGrid label="Resolution" items={videoResolutionOptions} value={resolution} onChange={onResolutionChange} columns="grid-cols-2" />
            ) : null}
            {selectedModel.supports.fpsControl ? (
              <ChoiceGrid label="Frame rate" items={videoFpsOptions} value={fps} onChange={onFpsChange} columns="grid-cols-3" />
            ) : null}
            {selectedModel.supports.styleStrength ? (
              <ChoiceGrid label="Style strength" items={styleStrengthOptions} value={styleStrength} onChange={onStyleStrengthChange} columns="grid-cols-3" />
            ) : null}
            {selectedModel.supports.shotType ? (
              <div>
                <Label>Shot type</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {videoShotTypes.map((shot) => (
                    <Chip key={shot} active={shotType === shot} onClick={() => onShotTypeChange(shot)}>
                      {shot}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
            {selectedModel.supports.motionGuidance ? (
              <Slider label="Motion guidance" value={motionGuidance} min={1} max={10} step={1} onChange={onMotionGuidanceChange} />
            ) : null}
            {selectedModel.supports.draftMode ? (
              <div className="grid gap-2">
                <ToggleRow label="Draft mode" checked={draftMode} onChange={onDraftModeChange} />
                <ToggleRow label="Prompt upsampling" checked={promptUpsampling} onChange={onPromptUpsamplingChange} />
                <ToggleRow label="Relax safety filter" checked={disableSafetyFilter} onChange={onDisableSafetyFilterChange} />
              </div>
            ) : null}
            {!selectedModel.supports.resolutionControl &&
            !selectedModel.supports.fpsControl &&
            !selectedModel.supports.styleStrength &&
            !selectedModel.supports.shotType &&
            !selectedModel.supports.motionGuidance &&
            !selectedModel.supports.draftMode ? (
              <div className="rounded-xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/45">
                This model manages advanced motion and output settings automatically.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0e10] p-3 text-xs leading-5 text-white/45">
            Open advanced controls for negative prompts and model-specific tuning.
          </div>
        )}
      </Panel>
    </div>
  );
}

function VideoModelPickerModal({
  models,
  selectedModelId,
  onSelect,
  onClose,
}: {
  models: ReplicateVideoModelConfig[];
  selectedModelId: ReplicateVideoModelId;
  onSelect: (modelId: ReplicateVideoModelId) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const selectedModel =
    models.find((model) => model.id === selectedModelId) ?? models[0];
  const recommendedModels = models.filter((model) => model.recommended).slice(0, 3);
  const filteredModels = models.filter((model) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;

    return [model.label, model.provider, model.description, model.badge]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-5 py-6 backdrop-blur-sm">
      <div className="flex h-[min(86vh,820px)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#1a1d20] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 px-5">
          <div>
            <h2 className="text-base font-semibold text-white">Model</h2>
            <p className="mt-1 text-xs text-white/45">
              Select the video model for the current generation.
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
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(45,212,191,0.2),rgba(0,0,0,0.15)_45%,rgba(217,70,239,0.22))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.22),transparent_30%)] opacity-70" />
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
                  <ModelGlyph model={model} />
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

function ModelGlyph({ model }: { model: ReplicateVideoModelConfig }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(45,212,191,0.28),rgba(99,102,241,0.24))] text-xs font-bold text-white">
      {model.provider.slice(0, 2).toUpperCase()}
    </span>
  );
}

function FrameUpload({
  label,
  helper,
  imageUrl,
  imageName,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  helper: string;
  imageUrl: string;
  imageName: string;
  uploading: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemove: () => void;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#0b0e10] p-3 transition hover:border-[#2dd4bf]/35 hover:bg-white/5">
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/8">
          {imageUrl ? (
            <img src={imageUrl} alt={label} className="size-full object-cover" />
          ) : uploading ? (
            <Loader2 className="size-5 animate-spin text-white/70" />
          ) : (
            <Upload className="size-5 text-white/70" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {imageName || `Upload ${label.toLowerCase()}`}
          </span>
          <span className="mt-1 block text-xs text-white/45">{helper}</span>
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => void onUpload(event)}
        />
      </label>
      {imageUrl ? (
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5" />
          Remove {label.toLowerCase()}
        </button>
      ) : null}
    </div>
  );
}

function AudioUpload({
  saveAudio,
  onSaveAudioChange,
  audioUrl,
  audioName,
  uploadingAudio,
  onAudioUpload,
  onRemoveAudio,
}: {
  saveAudio: boolean;
  onSaveAudioChange: (value: boolean) => void;
  audioUrl: string;
  audioName: string;
  uploadingAudio: boolean;
  onAudioUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveAudio: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0e10] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Audio</p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Generate audio, or attach a sound reference when the model can use it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSaveAudioChange(!saveAudio)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            saveAudio
              ? "border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#b7fff5]"
              : "border-white/10 bg-white/5 text-white/55"
          )}
        >
          {saveAudio ? "Audio on" : "Audio off"}
        </button>
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/4 p-3 transition hover:border-[#2dd4bf]/35 hover:bg-white/8">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/8">
          {uploadingAudio ? (
            <Loader2 className="size-4 animate-spin text-white/70" />
          ) : (
            <Film className="size-4 text-white/70" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">
            {audioName || "Upload audio reference"}
          </span>
          <span className="mt-1 block text-xs text-white/45">MP3, WAV, M4A, or OGG</span>
        </span>
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(event) => void onAudioUpload(event)}
        />
      </label>

      {audioUrl ? (
        <div className="mt-3 space-y-2">
          <audio src={audioUrl} controls className="h-9 w-full" />
          <button
            type="button"
            onClick={onRemoveAudio}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" />
            Remove audio
          </button>
        </div>
      ) : null}
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

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{children}</span>;
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

function ChoiceGrid({
  label,
  items,
  value,
  onChange,
  columns,
}: {
  label: string;
  items: ReadonlyArray<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  columns: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className={cn("mt-2 grid gap-2", columns)}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "h-10 rounded-lg border text-xs font-medium transition",
              value === item.value
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b0e10] px-3 py-3 text-left text-sm text-white/70 transition hover:bg-white/5"
    >
      <span>{label}</span>
      <span className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-[#2dd4bf]" : "bg-white/15")}>
        <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", checked ? "left-6" : "left-1")} />
      </span>
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
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs text-white/60">{value}</span>
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
