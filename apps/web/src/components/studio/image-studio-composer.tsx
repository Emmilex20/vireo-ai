"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Loader2,
  ImagePlus,
  RefreshCcw,
  RotateCcw,
  Settings2,
  Sparkles,
  Wand2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getImageModelUiOptions,
  listReplicateImageModels,
  type ReplicateImageModelId,
} from "@/lib/ai/providers/replicate-image-models";
import { getImageGenerationCost } from "@/lib/image-generation-config";
import { StudioSectionTitle } from "@/components/shared/studio-section-title";
import { AdvancedImageSettings } from "./advanced-image-settings";
import { AspectRatioSelector } from "./aspect-ratio-selector";
import { ControlGroup } from "./control-group";
import { ImageModelSelector } from "./image-model-selector";
import { PromptTemplatesPanel } from "@/components/prompts/prompt-templates-panel";
import { PromptDraftsPanel } from "./prompt-drafts-panel";
import { PromptQuickActions } from "./prompt-quick-actions";
import { PromptSuggestions } from "./prompt-suggestions";
import { StylePresets } from "./style-presets";
import { StudioCard } from "./studio-card";
import { StudioStatusBar } from "./studio-status-bar";
import { DesktopImageCreatorPage } from "./desktop-image-creator-page";
import { MobileImageCreatorPage } from "./mobile-image-creator-page";
import {
  clearStudioSessionState,
  loadStudioSessionState,
  saveStudioSessionState,
} from "./session-storage";
import { hasMeaningfulStudioState } from "./session-utils";
import type { QualityMode, StudioGenerationSetup } from "./types";
import type { StudioMode } from "./studio-mode-config";

type PromptDraft = {
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

type ReusePayload = {
  prompt: string;
  negativePrompt: string;
  modelId?: ReplicateImageModelId;
  referenceImageUrl?: string;
  style: string;
  aspectRatio: string;
  qualityMode: QualityMode;
  promptBoost: boolean;
  seed: number | null;
  steps: number;
  guidance: number;
};

const imageModels = listReplicateImageModels();
const defaultModelId = "openai/gpt-image-2" as const;

type ImageStudioComposerProps = {
  onChangeMode?: (mode: StudioMode) => void;
};

export function ImageStudioComposer({ onChangeMode }: ImageStudioComposerProps = {}) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModelId, setSelectedModelId] =
    useState<ReplicateImageModelId>(defaultModelId);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [referenceImageName, setReferenceImageName] = useState("");
  const [uploadingReferenceImage, setUploadingReferenceImage] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [qualityMode, setQualityMode] = useState<QualityMode>("high");
  const [promptBoost, setPromptBoost] = useState(true);
  const [seed, setSeed] = useState("");
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7.5);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [lastUsedSetup, setLastUsedSetup] =
    useState<StudioGenerationSetup | null>(null);
  const [variationCount, setVariationCount] = useState(0);
  const [draftTitle, setDraftTitle] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [drafts, setDrafts] = useState<PromptDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const canGenerate = useMemo(() => {
    return prompt.trim().length >= 5 && !loading;
  }, [prompt, loading]);

  const canGenerateVariation = useMemo(() => {
    return !!lastUsedSetup && !loading;
  }, [lastUsedSetup, loading]);

  const activeDraftTitle = useMemo(() => {
    if (!activeDraftId) return null;

    return drafts.find((draft) => draft.id === activeDraftId)?.title ?? null;
  }, [activeDraftId, drafts]);

  const parsedSeed = useMemo(() => {
    const value = Number(seed);

    return seed.trim() && Number.isFinite(value) ? value : null;
  }, [seed]);

  const selectedModel = useMemo(
    () => imageModels.find((model) => model.id === selectedModelId) ?? imageModels[0],
    [selectedModelId]
  );
  const selectedModelOptions = useMemo(
    () => getImageModelUiOptions(selectedModel),
    [selectedModel]
  );

  const supportsReferenceImage = selectedModel.supports.referenceImage;
  const supportsSeed = selectedModel.supports.seed;
  const supportsSteps = selectedModel.supports.steps;
  const supportsGuidance = selectedModel.supports.guidance;

  useEffect(() => {
    if (!selectedModelOptions.aspectRatios.includes(selectedAspectRatio)) {
      setSelectedAspectRatio(selectedModel.defaultAspectRatio);
    }
  }, [
    selectedAspectRatio,
    selectedModel.defaultAspectRatio,
    selectedModelOptions.aspectRatios,
  ]);

  function normalizeAspectRatioForModel(
    modelId: ReplicateImageModelId,
    ratio?: string | null
  ) {
    const model = imageModels.find((item) => item.id === modelId) ?? imageModels[0];
    const options = getImageModelUiOptions(model).aspectRatios;

    return ratio && options.includes(ratio) ? ratio : model.defaultAspectRatio;
  }

  const imageCost = useMemo(
    () =>
      getImageGenerationCost({
        modelId: selectedModelId,
        qualityMode,
        seed: parsedSeed,
        steps,
        guidance,
      }),
    [guidance, parsedSeed, qualityMode, selectedModelId, steps]
  );

  const hasPersistedSession = useMemo(() => {
    if (!sessionHydrated) return false;

    return hasMeaningfulStudioState({
      prompt,
      negativePrompt,
      modelId: selectedModelId,
      referenceImageUrl,
      style: selectedStyle,
      aspectRatio: selectedAspectRatio,
      qualityMode,
      promptBoost,
      seed: parsedSeed,
      steps,
      guidance,
      draftTitle,
    });
  }, [
    sessionHydrated,
    prompt,
    negativePrompt,
    selectedModelId,
    referenceImageUrl,
    selectedStyle,
    selectedAspectRatio,
    qualityMode,
    promptBoost,
    parsedSeed,
    steps,
    guidance,
    draftTitle,
  ]);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const res = await fetch("/api/drafts?type=image");
        const data = await res.json();

        setDrafts(data.drafts ?? []);
      } catch {
        setDrafts([]);
      }
    }

    loadDrafts();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const raw = sessionStorage.getItem("vireon_studio_reuse_payload");

      try {
        if (raw) {
          const payload: ReusePayload = JSON.parse(raw);

          setPrompt(payload.prompt ?? "");
          setNegativePrompt(payload.negativePrompt ?? "");
          const payloadModelId = payload.modelId ?? defaultModelId;
          setSelectedModelId(payloadModelId);
          setReferenceImageUrl(payload.referenceImageUrl ?? "");
          setReferenceImageName(payload.referenceImageUrl ? "History reference image" : "");
          setSelectedStyle(payload.style ?? "Cinematic");
          setSelectedAspectRatio(
            normalizeAspectRatioForModel(payloadModelId, payload.aspectRatio)
          );
          setQualityMode(payload.qualityMode ?? "high");
          setPromptBoost(payload.promptBoost ?? true);
          setSeed(payload.seed != null ? String(payload.seed) : "");
          setSteps(payload.steps ?? 30);
          setGuidance(payload.guidance ?? 7.5);
          setAdvancedOpen(true);
          setActiveDraftId(null);
          setSelectedSuggestion(null);
          setLastAction("Loaded setup from generation history.");
          return;
        }

        const persisted = loadStudioSessionState();
        if (!persisted) return;

        setPrompt(persisted.prompt ?? "");
        setNegativePrompt(persisted.negativePrompt ?? "");
        const persistedModelId =
          (persisted.modelId as ReplicateImageModelId | undefined) ??
          defaultModelId;
        setSelectedModelId(persistedModelId);
        setReferenceImageUrl(persisted.referenceImageUrl ?? "");
        setReferenceImageName(
          persisted.referenceImageUrl ? "Saved reference image" : ""
        );
        setSelectedStyle(persisted.style ?? "Cinematic");
        setSelectedAspectRatio(
          normalizeAspectRatioForModel(persistedModelId, persisted.aspectRatio)
        );
        setQualityMode(persisted.qualityMode ?? "high");
        setPromptBoost(persisted.promptBoost ?? true);
        setSeed(persisted.seed != null ? String(persisted.seed) : "");
        setSteps(persisted.steps ?? 30);
        setGuidance(persisted.guidance ?? 7.5);
        setDraftTitle(persisted.draftTitle ?? "");
        setLastAction("Restored unfinished studio session.");
      } catch {
      } finally {
        sessionStorage.removeItem("vireon_studio_reuse_payload");
        setSessionHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!sessionHydrated) return;

    const snapshot = {
      prompt,
      negativePrompt,
      modelId: selectedModelId,
      referenceImageUrl,
      style: selectedStyle,
      aspectRatio: selectedAspectRatio,
      qualityMode,
      promptBoost,
      seed: parsedSeed,
      steps,
      guidance,
      draftTitle,
    };

    saveStudioSessionState(snapshot);
  }, [
    sessionHydrated,
    prompt,
    negativePrompt,
    selectedModelId,
    referenceImageUrl,
    selectedStyle,
    selectedAspectRatio,
    qualityMode,
    promptBoost,
    parsedSeed,
    steps,
    guidance,
    draftTitle,
  ]);

  function buildCurrentSetup(): StudioGenerationSetup {
    return {
      prompt,
      negativePrompt,
      modelId: selectedModelId,
      referenceImageUrl,
      style: selectedStyle,
      aspectRatio: selectedAspectRatio,
      qualityMode,
      promptBoost,
      seed: parsedSeed,
      steps,
      guidance,
    };
  }

  async function runGeneration(
    setup: StudioGenerationSetup,
    isVariation = false
  ) {
    setLoading(true);
    setImage(null);

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        body: JSON.stringify({
          prompt: setup.prompt,
          negativePrompt: setup.negativePrompt,
          modelId: setup.modelId,
          referenceImageUrl: setup.referenceImageUrl || undefined,
          style: setup.style,
          aspectRatio: setup.aspectRatio,
          qualityMode: setup.qualityMode,
          promptBoost: setup.promptBoost,
          seed: setup.seed,
          steps: setup.steps,
          guidance: setup.guidance,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Failed to generate image");
        setLoading(false);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        return;
      }

      const jobId = data.jobId;
      const nextVariationCount = isVariation ? variationCount + 1 : 0;

      setLastUsedSetup(setup);
      setVariationCount(nextVariationCount);

      if (data.status === "completed") {
        setImage(data.outputUrl);
        setLoading(false);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        setLastAction(
          isVariation
            ? `Variation ${nextVariationCount} completed successfully.`
            : "Image generation completed successfully."
        );
        return;
      }

      if (data.status === "failed") {
        setLoading(false);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        setLastAction(
          data.failureReason ||
            "Image generation failed. You can retry with the same setup."
        );
        window.alert(data.failureReason || "Image generation failed");
        return;
      }

      setLastAction(
        isVariation
          ? `Generated variation ${nextVariationCount}.`
          : "Started a new image generation."
      );

      const interval = window.setInterval(async () => {
        const statusRes = await fetch(`/api/generate/status/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          setImage(statusData.outputUrl);
          window.clearInterval(interval);
          setLoading(false);
          window.dispatchEvent(new Event("vireon:credits-updated"));
          setLastAction(
            isVariation
              ? `Variation ${nextVariationCount} completed successfully.`
              : "Image generation completed successfully."
          );
        }

        if (statusData.status === "failed") {
          window.clearInterval(interval);
          setLoading(false);
          window.dispatchEvent(new Event("vireon:credits-updated"));
          setLastUsedSetup(setup);
          setLastAction(
            statusData.failureReason ||
              "Image generation failed. You can retry with the same setup."
          );
          window.alert(statusData.failureReason || "Image generation failed");
        }
      }, 1500);
    } catch {
      setLoading(false);
      setLastAction("Something went wrong during generation.");
      window.alert("Something went wrong");
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;

    await runGeneration(buildCurrentSetup(), false);
  }

  async function handleGenerateVariation() {
    if (!lastUsedSetup) return;

    await runGeneration(lastUsedSetup, true);
  }

  function handleSuggestionSelect(suggestedPrompt: string) {
    setSelectedSuggestion(suggestedPrompt);
    setLastAction("Selected a prompt suggestion.");
  }

  function handleReplacePrompt() {
    if (!selectedSuggestion) return;

    setPrompt(selectedSuggestion);
    setActiveDraftId(null);
    setLastAction("Replaced the current prompt with a suggestion.");
  }

  function handleAppendPrompt() {
    if (!selectedSuggestion) return;

    setPrompt((prev) => {
      const trimmed = prev.trim();

      if (!trimmed) return selectedSuggestion;

      return `${trimmed}, ${selectedSuggestion}`;
    });
    setActiveDraftId(null);
    setLastAction("Appended a suggestion to the current prompt.");
  }

  function handleClearPrompt() {
    setPrompt("");
    setNegativePrompt("");
    setSelectedSuggestion(null);
    setActiveDraftId(null);
    setLastAction("Cleared the current prompt fields.");
  }

  async function handleReferenceImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingReferenceImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/image-reference", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Failed to upload reference image");
        return;
      }

      setReferenceImageUrl(data.url);
      setReferenceImageName(data.originalFilename ?? file.name);
      setActiveDraftId(null);
      setLastAction("Attached a reference image for guided generation.");
    } catch {
      window.alert("Failed to upload reference image");
    } finally {
      setUploadingReferenceImage(false);
      event.target.value = "";
    }
  }

  function handleRemoveReferenceImage() {
    setReferenceImageUrl("");
    setReferenceImageName("");
    setActiveDraftId(null);
    setLastAction("Removed the reference image.");
  }

  function handleResetSession() {
    setPrompt("");
    setNegativePrompt("");
    setSelectedModelId(defaultModelId);
    setReferenceImageUrl("");
    setReferenceImageName("");
    setSelectedStyle("Cinematic");
    setSelectedAspectRatio("1:1");
    setQualityMode("high");
    setPromptBoost(true);
    setSeed("");
    setSteps(30);
    setGuidance(7.5);
    setDraftTitle("");
    setSelectedSuggestion(null);
    setActiveDraftId(null);
    setAdvancedOpen(false);
    setLastUsedSetup(null);
    setVariationCount(0);
    setImage(null);
    clearStudioSessionState();
    setLastAction("Reset the current studio session.");
  }

  async function handleSaveDraft() {
    if (!draftTitle.trim()) {
      window.alert("Please enter a draft title");
      return;
    }

    if (prompt.trim().length < 5) {
      window.alert("Prompt must be at least 5 characters");
      return;
    }

    setSavingDraft(true);

    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: selectedModelId,
          title: draftTitle,
          prompt,
          negativePrompt,
          style: selectedStyle,
          aspectRatio: selectedAspectRatio,
          qualityMode,
          promptBoost,
          seed: parsedSeed,
          steps,
          guidance,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Failed to save draft");
        setSavingDraft(false);
        return;
      }

      setDrafts((prev) => [data.draft, ...prev]);
      setActiveDraftId(data.draft.id);
      setDraftTitle("");
      setLastAction("Saved the current setup as a draft.");
      window.alert("Draft saved");
    } catch {
      setLastAction("Failed to save draft.");
      window.alert("Something went wrong");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleDeleteDraft(draftId: string) {
    setDeletingDraftId(draftId);

    try {
      const res = await fetch(
        `/api/drafts?draftId=${encodeURIComponent(draftId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Failed to delete draft");
        setDeletingDraftId(null);
        return;
      }

      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));

      if (activeDraftId === draftId) {
        setActiveDraftId(null);
      }

      setLastAction("Deleted a saved draft.");
    } catch {
      setLastAction("Failed to delete draft.");
      window.alert("Something went wrong");
    } finally {
      setDeletingDraftId(null);
    }
  }

  function handleLoadDraft(draft: PromptDraft) {
    setPrompt(draft.prompt);
    setNegativePrompt(draft.negativePrompt ?? "");
    const draftModelId = draft.modelId ?? defaultModelId;
    setSelectedModelId(draftModelId);
    setReferenceImageUrl("");
    setReferenceImageName("");
    setSelectedStyle(draft.style || "Cinematic");
    setSelectedAspectRatio(
      normalizeAspectRatioForModel(draftModelId, draft.aspectRatio)
    );
    setQualityMode((draft.qualityMode as QualityMode) || "high");
    setPromptBoost(draft.promptBoost);
    setSeed(draft.seed != null ? String(draft.seed) : "");
    setSteps(draft.steps ?? 30);
    setGuidance(draft.guidance ?? 7.5);
    setAdvancedOpen(true);
    setActiveDraftId(draft.id);
    setDraftTitle(draft.title);
    setSelectedSuggestion(null);
    setLastAction(`Loaded draft "${draft.title}".`);
  }

  function handleModelChange(modelId: ReplicateImageModelId) {
    const nextModel = imageModels.find((model) => model.id === modelId);
    if (!nextModel) return;

    setSelectedModelId(modelId);
    setSelectedAspectRatio(nextModel.defaultAspectRatio);
    setActiveDraftId(null);

    if (!nextModel.supports.referenceImage) {
      setReferenceImageUrl("");
      setReferenceImageName("");
    }

    if (!nextModel.supports.seed) {
      setSeed("");
    }

    if (!nextModel.supports.steps) {
      setSteps(30);
    }

    if (!nextModel.supports.guidance) {
      setGuidance(7.5);
    }

    setLastAction(`Switched image model to ${nextModel.label}.`);
  }

  return (
    <>
      <DesktopImageCreatorPage
        onChangeMode={onChangeMode}
        selectedModelId={selectedModelId}
        onModelChange={handleModelChange}
        supportsReferenceImage={supportsReferenceImage}
        referenceImageUrl={referenceImageUrl}
        referenceImageName={referenceImageName}
        uploadingReferenceImage={uploadingReferenceImage}
        onReferenceImageUpload={handleReferenceImageUpload}
        onRemoveReferenceImage={handleRemoveReferenceImage}
        prompt={prompt}
        onPromptChange={(value) => {
          setPrompt(value);
          setActiveDraftId(null);
        }}
        negativePrompt={negativePrompt}
        onNegativePromptChange={(value) => {
          setNegativePrompt(value);
          setActiveDraftId(null);
        }}
        onClearPrompt={handleClearPrompt}
        onResetSession={handleResetSession}
        selectedStyle={selectedStyle}
        onStyleChange={(value) => {
          setSelectedStyle(value);
          setActiveDraftId(null);
        }}
        selectedAspectRatio={selectedAspectRatio}
        aspectRatioOptions={selectedModelOptions.aspectRatios}
        onAspectRatioChange={(value) => {
          setSelectedAspectRatio(value);
          setActiveDraftId(null);
        }}
        qualityMode={qualityMode}
        onQualityModeChange={(value) => {
          setQualityMode(value);
          setActiveDraftId(null);
        }}
        imageCost={imageCost}
        image={image}
        loading={loading}
        canGenerate={canGenerate}
        onGenerate={handleGenerate}
        canGenerateVariation={canGenerateVariation}
        onGenerateVariation={handleGenerateVariation}
        advancedOpen={advancedOpen}
        onToggleAdvancedOpen={() => setAdvancedOpen((prev) => !prev)}
        supportsSeed={supportsSeed}
        supportsSteps={supportsSteps}
        supportsGuidance={supportsGuidance}
        promptBoost={promptBoost}
        onPromptBoostChange={(value) => {
          setPromptBoost(value);
          setActiveDraftId(null);
        }}
        seed={seed}
        onSeedChange={(value) => {
          setSeed(value);
          setActiveDraftId(null);
        }}
        steps={steps}
        onStepsChange={(value) => {
          setSteps(value);
          setActiveDraftId(null);
        }}
        guidance={guidance}
        onGuidanceChange={(value) => {
          setGuidance(value);
          setActiveDraftId(null);
        }}
        draftTitle={draftTitle}
        onDraftTitleChange={setDraftTitle}
        savingDraft={savingDraft}
        onSaveDraft={handleSaveDraft}
        drafts={drafts}
        activeDraftId={activeDraftId}
        deletingDraftId={deletingDraftId}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        selectedSuggestion={selectedSuggestion}
        onSuggestionSelect={handleSuggestionSelect}
        lastAction={lastAction}
      />

      <MobileImageCreatorPage
        onChangeMode={onChangeMode}
        selectedModelId={selectedModelId}
        onModelChange={handleModelChange}
        supportsReferenceImage={supportsReferenceImage}
        referenceImageUrl={referenceImageUrl}
        referenceImageName={referenceImageName}
        uploadingReferenceImage={uploadingReferenceImage}
        onReferenceImageUpload={handleReferenceImageUpload}
        onRemoveReferenceImage={handleRemoveReferenceImage}
        prompt={prompt}
        onPromptChange={(value) => {
          setPrompt(value);
          setActiveDraftId(null);
        }}
        negativePrompt={negativePrompt}
        onNegativePromptChange={(value) => {
          setNegativePrompt(value);
          setActiveDraftId(null);
        }}
        onClearPrompt={handleClearPrompt}
        onResetSession={handleResetSession}
        selectedStyle={selectedStyle}
        onStyleChange={(value) => {
          setSelectedStyle(value);
          setActiveDraftId(null);
        }}
        selectedAspectRatio={selectedAspectRatio}
        aspectRatioOptions={selectedModelOptions.aspectRatios}
        onAspectRatioChange={(value) => {
          setSelectedAspectRatio(value);
          setActiveDraftId(null);
        }}
        qualityMode={qualityMode}
        onQualityModeChange={(value) => {
          setQualityMode(value);
          setActiveDraftId(null);
        }}
        imageCost={imageCost}
        image={image}
        loading={loading}
        canGenerate={canGenerate}
        onGenerate={handleGenerate}
        canGenerateVariation={canGenerateVariation}
        onGenerateVariation={handleGenerateVariation}
        advancedOpen={advancedOpen}
        onToggleAdvancedOpen={() => setAdvancedOpen((prev) => !prev)}
        supportsSeed={supportsSeed}
        supportsSteps={supportsSteps}
        supportsGuidance={supportsGuidance}
        promptBoost={promptBoost}
        onPromptBoostChange={(value) => {
          setPromptBoost(value);
          setActiveDraftId(null);
        }}
        seed={seed}
        onSeedChange={(value) => {
          setSeed(value);
          setActiveDraftId(null);
        }}
        steps={steps}
        onStepsChange={(value) => {
          setSteps(value);
          setActiveDraftId(null);
        }}
        guidance={guidance}
        onGuidanceChange={(value) => {
          setGuidance(value);
          setActiveDraftId(null);
        }}
        draftTitle={draftTitle}
        onDraftTitleChange={setDraftTitle}
        savingDraft={savingDraft}
        onSaveDraft={handleSaveDraft}
        drafts={drafts}
        activeDraftId={activeDraftId}
        deletingDraftId={deletingDraftId}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        selectedSuggestion={selectedSuggestion}
        onSuggestionSelect={handleSuggestionSelect}
        lastAction={lastAction}
      />

      <section className="hidden">
      <div className="space-y-6">
        <StudioStatusBar
          hasPrompt={prompt.trim().length >= 5}
          activeDraftTitle={activeDraftTitle}
          hasPersistedSession={hasPersistedSession}
          variationReady={!!lastUsedSetup}
          variationCount={variationCount}
          lastAction={lastAction}
        />

        <StudioCard>
          <StudioSectionTitle
            title="Create image"
            subtitle="Describe what you want to generate with premium creative control."
            action={
              <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={handleClearPrompt}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="size-3" />
                  Reset session
                </button>
              </div>
            }
          />

          <div className="space-y-5">
            <ControlGroup
              title="Image model"
              subtitle="Choose the generation engine first. Each model has its own defaults, strengths, and control surface."
            >
              <ImageModelSelector
                value={selectedModelId}
                onChange={handleModelChange}
              />

              <div className="mt-4 rounded-[1.25rem] border border-primary/20 bg-primary/10 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-white">
                    {selectedModel.label}
                  </p>
                  <span className="rounded-full border border-primary/20 bg-black/20 px-2.5 py-1 text-[11px] text-primary">
                    Default ratio {selectedModel.defaultAspectRatio}
                  </span>
                  <span className="rounded-full border border-primary/20 bg-black/20 px-2.5 py-1 text-[11px] text-primary">
                    {supportsReferenceImage
                      ? "Reference image ready"
                      : "Prompt only"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {selectedModel.description}
                </p>
              </div>
            </ControlGroup>

            <ControlGroup
              title="Prompt editor"
              subtitle="Write the core instruction and define what the model should avoid."
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Main prompt
                  </label>
                  <textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      setActiveDraftId(null);
                    }}
                    placeholder="Describe your image in detail..."
                    className="min-h-40 w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Strong prompts usually describe subject, mood, lighting,
                    composition, and style.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Negative prompt
                  </label>
                  <textarea
                    rows={3}
                    value={negativePrompt}
                    onChange={(e) => {
                      setNegativePrompt(e.target.value);
                      setActiveDraftId(null);
                    }}
                    placeholder="What should the model avoid?"
                    className="min-h-40 w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {selectedModel.supports.negativePrompt
                      ? "This model accepts a dedicated negative prompt."
                      : "For this model, avoid instructions are folded into the main prompt pipeline for you."}
                  </p>
                </div>
              </div>
            </ControlGroup>

            <PromptTemplatesPanel
              type="image"
              onUseTemplate={(template) => {
                setPrompt(template.prompt);
                setNegativePrompt(template.negativePrompt ?? "");
                setActiveDraftId(null);
                setLastAction("Loaded an image prompt template.");
              }}
            />

            <div className="grid gap-5">
              <ControlGroup
                title="Style direction"
                subtitle="Choose the visual language for the output."
              >
                <StylePresets
                  value={selectedStyle}
                  onChange={(value) => {
                    setSelectedStyle(value);
                    setActiveDraftId(null);
                  }}
                />
              </ControlGroup>

              <ControlGroup
                title="Output format"
                subtitle={`Set the canvas ratio for the final image. ${selectedModel.label} defaults to ${selectedModel.defaultAspectRatio}.`}
              >
                <AspectRatioSelector
                  value={selectedAspectRatio}
                  onChange={(value) => {
                    setSelectedAspectRatio(value);
                    setActiveDraftId(null);
                  }}
                />
              </ControlGroup>

              <ControlGroup
                title="Reference image"
                subtitle={
                  supportsReferenceImage
                    ? "Upload an optional guide image when you want the model to borrow composition, mood, or visual structure."
                    : `${selectedModel.label} does not use reference-image guidance.`
                }
              >
                {supportsReferenceImage ? (
                  <div className="space-y-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-black/20 px-5 py-6 text-center transition hover:border-primary/25 hover:bg-white/5">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                        {uploadingReferenceImage ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Upload className="size-5" />
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-white">
                        {uploadingReferenceImage
                          ? "Uploading reference image..."
                          : "Upload a reference image"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        PNG, JPG, or WEBP up to 10MB. The uploaded image is used
                        only to guide this generation setup.
                      </p>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(event) =>
                          void handleReferenceImageUpload(event)
                        }
                      />
                    </label>

                    {referenceImageUrl ? (
                      <div className="overflow-hidden rounded-[1.25rem] border border-primary/20 bg-black/20">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              Reference image attached
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {referenceImageName || "Uploaded reference image"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveReferenceImage}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                          >
                            <X className="size-3" />
                            Remove
                          </button>
                        </div>
                        <Image
                          src={referenceImageUrl}
                          alt="Reference image"
                          width={1200}
                          height={720}
                          className="max-h-72 w-full object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
                    Choose a model like Seedream 4.5 or Ideogram v3 Quality if
                    you want to guide generation with an uploaded image.
                  </div>
                )}
              </ControlGroup>
            </div>
          </div>
        </StudioCard>

        <AdvancedImageSettings
          open={advancedOpen}
          onToggleOpen={() => setAdvancedOpen((prev) => !prev)}
          supportsSeed={supportsSeed}
          supportsSteps={supportsSteps}
          supportsGuidance={supportsGuidance}
          qualityMode={qualityMode}
          onQualityModeChange={(value) => {
            setQualityMode(value);
            setActiveDraftId(null);
          }}
          promptBoost={promptBoost}
          onPromptBoostChange={(value) => {
            setPromptBoost(value);
            setActiveDraftId(null);
          }}
          seed={seed}
          onSeedChange={(value) => {
            setSeed(value);
            setActiveDraftId(null);
          }}
          steps={steps}
          onStepsChange={(value) => {
            setSteps(value);
            setActiveDraftId(null);
          }}
          guidance={guidance}
          onGuidanceChange={(value) => {
            setGuidance(value);
            setActiveDraftId(null);
          }}
        />

        <PromptDraftsPanel
          drafts={drafts}
          activeDraftId={activeDraftId}
          deletingDraftId={deletingDraftId}
          onLoadDraft={handleLoadDraft}
          onDeleteDraft={handleDeleteDraft}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-4 xl:sticky xl:top-24 xl:space-y-6">
          <StudioCard className="overflow-hidden p-0!">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Generation panel
                </p>
                <p className="text-xs text-muted-foreground">
                  Premium Kling-class studio direction for Vireon AI
                </p>
              </div>

              <div className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary sm:px-3 sm:text-xs">
                Image
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_24%),linear-gradient(135deg,#111827,#1f2937,#0f172a)]">
                {image ? (
                  <Image
                    src={image}
                    alt="Generated"
                    fill
                    sizes="(min-width: 1280px) 40vw, (min-width: 640px) 90vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <ImagePlus className="size-6" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-white">
                      {loading
                        ? "Generating your image..."
                        : "Your generated image preview will appear here"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {loading
                        ? "Please wait while the job completes"
                        : "Completed generations will also be saved to Assets"}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-5">
                <ControlGroup
                  title="Current setup"
                  subtitle="Live summary of the active image configuration."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Sparkles className="size-4 text-primary" />
                        Selected model
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {selectedModel.label}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Sparkles className="size-4 text-primary" />
                        Selected style
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {selectedStyle}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Wand2 className="size-4 text-primary" />
                        Output format
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {selectedAspectRatio}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Model: {selectedModel.label}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Style: {selectedStyle}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Ratio: {selectedAspectRatio}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Quality: {qualityMode}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Steps: {steps}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Guidance: {guidance.toFixed(1)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Prompt boost: {promptBoost ? "On" : "Off"}
                    </span>
                    {seed.trim() ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        Seed: {seed}
                      </span>
                    ) : null}
                    {referenceImageUrl ? (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
                        Reference image attached
                      </span>
                    ) : null}
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Cost: {imageCost} credits
                    </span>
                    {activeDraftId ? (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
                        Draft loaded
                      </span>
                    ) : null}
                    {variationCount > 0 ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                        Variation {variationCount}
                      </span>
                    ) : null}
                  </div>
                </ControlGroup>

                <ControlGroup
                  title="Save reusable setup"
                  subtitle="Turn your current configuration into a reusable draft."
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Draft title"
                      className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
                    />
                    <Button
                      onClick={handleSaveDraft}
                      disabled={savingDraft}
                      variant="outline"
                      className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                    >
                      {savingDraft ? "Saving..." : "Save draft"}
                    </Button>
                  </div>
                </ControlGroup>

                <ControlGroup
                  title="Actions"
                  subtitle="Generate, refine, and iterate from the current setup."
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => setAdvancedOpen((prev) => !prev)}
                      className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Settings2 className="mr-2 size-4" />
                      {advancedOpen ? "Hide settings" : "Advanced settings"}
                    </Button>

                    <Button
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {loading ? "Generating..." : "Generate image"}
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      variant="outline"
                      onClick={handleGenerateVariation}
                      disabled={!canGenerateVariation}
                      className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 disabled:opacity-60"
                    >
                      <RefreshCcw className="mr-2 size-4" />
                      Generate variation
                    </Button>

                    <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground">
                      {lastUsedSetup
                        ? "Uses your last successful or failed setup"
                        : "Run one generation to unlock retries and variations"}
                    </div>
                  </div>

                  <Link
                    href="/assets"
                    className="mt-4 block text-center text-sm text-primary transition hover:text-primary/80"
                  >
                    View saved assets
                  </Link>
                </ControlGroup>
              </div>
            </div>
          </StudioCard>

          <StudioCard>
            <StudioSectionTitle
              title="Prompt suggestions"
              subtitle="Select a suggestion, then replace or append it to your current prompt."
            />
            <PromptSuggestions
              selectedPrompt={selectedSuggestion}
              onSelect={handleSuggestionSelect}
            />
            <div className="mt-4">
              <PromptQuickActions
                onReplace={handleReplacePrompt}
                onAppend={handleAppendPrompt}
                disabled={!selectedSuggestion}
              />
            </div>
          </StudioCard>
        </div>
      </div>
      </section>
    </>
  );
}
