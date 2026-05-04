"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Film,
  Loader2,
  Move3d,
  Music4,
  RefreshCcw,
  RotateCcw,
  Settings2,
  Sparkles,
  Upload,
  X,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getVideoModelUiOptions,
  resolveReplicateVideoModel,
  resolveReplicateVideoModelBySlug,
  type ReplicateVideoModelId,
} from "@/lib/ai/providers/replicate-video-models";
import { getVideoGenerationCost } from "@/lib/video-generation-config";
import {
  videoAspectRatios,
  videoDurations,
  videoResolutionOptions,
} from "@/lib/video-studio-data";
import { PromptTemplatesPanel } from "@/components/prompts/prompt-templates-panel";
import { StudioSectionTitle } from "@/components/shared/studio-section-title";
import { PromptQuickActions } from "./prompt-quick-actions";
import { VideoDurationSelector } from "./video-duration-selector";
import { VideoAspectRatioSelector } from "./video-aspect-ratio-selector";
import { MotionIntensitySelector } from "./motion-intensity-selector";
import { CameraMoveSelector } from "./camera-move-selector";
import { VideoPromptSuggestions } from "./video-prompt-suggestions";
import { VideoAdvancedSettings } from "./video-advanced-settings";
import { VideoDraftsPanel } from "./video-drafts-panel";
import { VideoModelSelector } from "./video-model-selector";
import { VideoStudioStatusBar } from "./video-studio-status-bar";
import { DesktopVideoCreatorPage } from "./desktop-video-creator-page";
import { MobileVideoCreatorPage } from "./mobile-video-creator-page";
import { StudioCard } from "./studio-card";
import { ControlGroup } from "./control-group";
import {
  clearVideoStudioSessionState,
  loadVideoStudioSessionState,
  saveVideoStudioSessionState
} from "./session-storage";
import { hasMeaningfulVideoStudioState } from "./video-session-utils";
import type { VideoGenerationSetup, VideoReusePayload } from "./video-types";
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

type VideoStudioComposerProps = {
  onChangeMode?: (mode: StudioMode) => void;
  initialModelSlug?: string;
};

export function VideoStudioComposer({
  onChangeMode,
  initialModelSlug,
}: VideoStudioComposerProps = {}) {
  const initialModelFromSlug = resolveReplicateVideoModelBySlug(initialModelSlug);
  const defaultModel = initialModelFromSlug ?? resolveReplicateVideoModel();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [endImageUrl, setEndImageUrl] = useState("");
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [sourceAssetId, setSourceAssetId] = useState("");
  const [uploadingSourceImage, setUploadingSourceImage] = useState(false);
  const [uploadingEndImage, setUploadingEndImage] = useState(false);
  const [uploadingReferenceImage, setUploadingReferenceImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [sourceImageName, setSourceImageName] = useState("");
  const [endImageName, setEndImageName] = useState("");
  const [referenceImageNames, setReferenceImageNames] = useState<string[]>([]);
  const [audioName, setAudioName] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<ReplicateVideoModelId>(
    defaultModel.id
  );
  const [resolution, setResolution] = useState(
    defaultModel.defaultResolution ?? "720p"
  );
  const [draftMode, setDraftMode] = useState(false);
  const [saveAudio, setSaveAudio] = useState(true);
  const [promptUpsampling, setPromptUpsampling] = useState(false);
  const [disableSafetyFilter, setDisableSafetyFilter] = useState(true);
  const [duration, setDuration] = useState(String(defaultModel.defaultDuration));
  const [aspectRatio, setAspectRatio] = useState(defaultModel.defaultAspectRatio);
  const [motionIntensity, setMotionIntensity] = useState("medium");
  const [cameraMove, setCameraMove] = useState("Slow Push In");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [styleStrength, setStyleStrength] = useState("medium");
  const [motionGuidance, setMotionGuidance] = useState(6);
  const [shotType, setShotType] = useState("Wide Shot");
  const [fps, setFps] = useState("24");

  const [draftTitle, setDraftTitle] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [drafts, setDrafts] = useState<VideoDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);

  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [hasPersistedSession, setHasPersistedSession] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lastUsedSetup, setLastUsedSetup] = useState<VideoGenerationSetup | null>(null);
  const [takeCount, setTakeCount] = useState(0);
  const [quotedVideoCost, setQuotedVideoCost] = useState<number | null>(null);
  const selectedModel = useMemo(
    () => resolveReplicateVideoModel(selectedModelId),
    [selectedModelId]
  );
  const selectedModelOptions = useMemo(
    () => getVideoModelUiOptions(selectedModel),
    [selectedModel]
  );
  const videoCost = useMemo(
    () =>
      getVideoGenerationCost({
        modelId: selectedModelId,
        duration: Number(duration),
        styleStrength,
        motionGuidance,
        fps: Number(fps),
      }),
    [duration, fps, motionGuidance, selectedModelId, styleStrength]
  );
  const displayVideoCost = quotedVideoCost ?? videoCost;

  async function fetchVideoQuote(setup: VideoGenerationSetup) {
    const res = await fetch("/api/credits/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        generationType: "video",
        modelId: setup.modelId,
        prompt: setup.prompt,
        resolution: setup.resolution,
        durationSeconds: Number(setup.duration),
        imageUrl: setup.imageUrl || undefined,
        endImageUrl: setup.endImageUrl || undefined,
        referenceImageUrls: setup.referenceImageUrls?.length
          ? setup.referenceImageUrls
          : undefined,
        audioUrl: setup.audioUrl || undefined,
        numberOfOutputs: 1,
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to quote video credits");
    }

    setQuotedVideoCost(data.requiredCredits);
    return data.requiredCredits as number;
  }

  const canGenerate = useMemo(() => prompt.trim().length >= 5 && !loading, [prompt, loading]);
  const canGenerateAnotherTake = useMemo(
    () => !!lastUsedSetup && !loading,
    [lastUsedSetup, loading]
  );

  useEffect(() => {
    if (!loading) return;

    const startedAt = Date.now();
    setGenerationProgress(4);

    const interval = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAt;
      const estimated = Math.min(96, 4 + (elapsedMs / 300000) * 92);

      setGenerationProgress((current) => Math.max(current, estimated));
    }, 500);

    return () => window.clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!selectedModelOptions.aspectRatios.includes(aspectRatio)) {
      setAspectRatio(selectedModel.defaultAspectRatio);
    }

    if (!selectedModelOptions.durations.includes(Number(duration))) {
      setDuration(String(selectedModel.defaultDuration));
    }

    if (
      selectedModelOptions.resolutions.length &&
      !selectedModelOptions.resolutions.includes(resolution)
    ) {
      setResolution(
        selectedModel.defaultResolution ?? selectedModelOptions.resolutions[0]
      );
    }
  }, [
    aspectRatio,
    duration,
    resolution,
    selectedModel,
    selectedModelOptions.aspectRatios,
    selectedModelOptions.durations,
    selectedModelOptions.resolutions,
  ]);

  const activeDraftTitle = useMemo(() => {
    if (!activeDraftId) return null;

    return drafts.find((draft) => draft.id === activeDraftId)?.title ?? null;
  }, [activeDraftId, drafts]);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const res = await fetch("/api/drafts?type=video");
        const data = await res.json();
        setDrafts(data.drafts ?? []);
      } catch {
      } finally {
        setSessionHydrated(true);
      }
    }

    loadDrafts();
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("vireon_video_studio_reuse_payload");
    if (!raw) return;

    try {
      const payload: VideoReusePayload = JSON.parse(raw);
      const reuseModel = resolveReplicateVideoModel(payload.modelId ?? defaultModel.id);

      setSelectedModelId(
        (payload.modelId as ReplicateVideoModelId | undefined) ?? defaultModel.id
      );
      setPrompt(payload.prompt ?? "");
      setNegativePrompt(payload.negativePrompt ?? "");
      setResolution(payload.resolution ?? reuseModel.defaultResolution ?? "720p");
      setDraftMode(payload.draftMode ?? false);
      setSaveAudio(payload.saveAudio ?? reuseModel.supports.audioGeneration);
      setPromptUpsampling(payload.promptUpsampling ?? false);
      setDisableSafetyFilter(payload.disableSafetyFilter ?? true);
      setDuration(payload.duration ?? "5");
      setAspectRatio(payload.aspectRatio ?? "16:9");
      setMotionIntensity(payload.motionIntensity ?? "medium");
      setCameraMove(payload.cameraMove ?? "Slow Push In");
      setStyleStrength(payload.styleStrength ?? "medium");
      setMotionGuidance(payload.motionGuidance ?? 6);
      setShotType(payload.shotType ?? "Wide Shot");
      setFps(payload.fps ?? "24");
      setImageUrl(payload.imageUrl ?? "");
      setSourceAssetId(payload.sourceAssetId ?? "");
      setAdvancedOpen(true);
      setActiveDraftId(null);
      setSelectedSuggestion(null);
      setLastAction("Loaded setup from video history.");
    } catch {
    } finally {
      sessionStorage.removeItem("vireon_video_studio_reuse_payload");
    }
  }, [defaultModel.defaultResolution, defaultModel.id]);

  useEffect(() => {
    if (!sessionHydrated) return;

    const persisted = loadVideoStudioSessionState();
    if (!persisted) {
      setHasPersistedSession(false);
      return;
    }
    const persistedModelId =
      initialModelFromSlug?.id ?? persisted.modelId ?? defaultModel.id;
    const persistedModel = resolveReplicateVideoModel(persistedModelId);

    setSelectedModelId(
      (persistedModelId as ReplicateVideoModelId | undefined) ?? defaultModel.id
    );
    setPrompt((prev) => prev || persisted.prompt || "");
    setNegativePrompt((prev) => prev || persisted.negativePrompt || "");
    setResolution(
      persisted.resolution || persistedModel.defaultResolution || "720p"
    );
    setDraftMode(persisted.draftMode ?? false);
    setSaveAudio(
      persisted.saveAudio ?? persistedModel.supports.audioGeneration
    );
    setPromptUpsampling(persisted.promptUpsampling ?? false);
    setDisableSafetyFilter(persisted.disableSafetyFilter ?? true);
    setDuration((prev) => prev || persisted.duration || "5");
    setAspectRatio((prev) => prev || persisted.aspectRatio || "16:9");
    setMotionIntensity((prev) => prev || persisted.motionIntensity || "medium");
    setCameraMove((prev) => prev || persisted.cameraMove || "Slow Push In");
    setStyleStrength((prev) => prev || persisted.styleStrength || "medium");
    setMotionGuidance(persisted.motionGuidance ?? 6);
    setShotType((prev) => prev || persisted.shotType || "Wide Shot");
    setFps((prev) => prev || persisted.fps || "24");
    setImageUrl((prev) => prev || persisted.imageUrl || "");
    setEndImageUrl((prev) => prev || persisted.endImageUrl || "");
    setReferenceImageUrls((prev) =>
      prev.length ? prev : persisted.referenceImageUrls ?? []
    );
    setAudioUrl((prev) => prev || persisted.audioUrl || "");
    setSourceAssetId((prev) => prev || persisted.sourceAssetId || "");
    setEndImageName((prev) =>
      prev || (persisted.endImageUrl ? "Saved end frame" : "")
    );
    setReferenceImageNames((prev) =>
      prev.length
        ? prev
        : (persisted.referenceImageUrls ?? []).map(
            (_, index) => `Saved reference ${index + 1}`
          )
    );
    setAudioName((prev) => prev || (persisted.audioUrl ? "Saved audio reference" : ""));
    setDraftTitle((prev) => prev || persisted.draftTitle || "");
    setHasPersistedSession(true);
    setLastAction((prev) => prev ?? "Restored unfinished video studio session.");
  }, [
    defaultModel.defaultResolution,
    defaultModel.id,
    initialModelFromSlug?.id,
    sessionHydrated,
  ]);

  useEffect(() => {
    if (!sessionHydrated || prompt.trim().length < 5) {
      setQuotedVideoCost(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/credits/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          signal: controller.signal,
          body: JSON.stringify({
            generationType: "video",
            modelId: selectedModelId,
            prompt,
            resolution,
            durationSeconds: Number(duration),
            imageUrl: imageUrl || undefined,
            endImageUrl: endImageUrl || undefined,
            referenceImageUrls: referenceImageUrls.length
              ? referenceImageUrls
              : undefined,
            audioUrl: audioUrl || undefined,
            numberOfOutputs: 1,
          })
        });

        const data = await res.json();

        if (res.ok) {
          setQuotedVideoCost(data.requiredCredits);
        }
      } catch {
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    sessionHydrated,
    selectedModelId,
    prompt,
    resolution,
    duration,
    imageUrl,
    endImageUrl,
    referenceImageUrls,
    audioUrl,
  ]);

  useEffect(() => {
    if (!sessionHydrated) return;

    const snapshot = {
      modelId: selectedModelId,
      prompt,
      negativePrompt,
      resolution,
      draftMode,
      saveAudio,
      promptUpsampling,
      disableSafetyFilter,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      imageUrl,
      endImageUrl,
      referenceImageUrls,
      audioUrl,
      sourceAssetId,
      draftTitle
    };

    saveVideoStudioSessionState(snapshot);
    setHasPersistedSession(hasMeaningfulVideoStudioState(snapshot));
  }, [
    sessionHydrated,
    selectedModelId,
    prompt,
    negativePrompt,
    resolution,
    draftMode,
    saveAudio,
    promptUpsampling,
    disableSafetyFilter,
    duration,
    aspectRatio,
    motionIntensity,
    cameraMove,
    styleStrength,
    motionGuidance,
    shotType,
    fps,
    imageUrl,
    endImageUrl,
    referenceImageUrls,
    audioUrl,
    sourceAssetId,
    draftTitle
  ]);

  function buildCurrentSetup(): VideoGenerationSetup {
    const supportsEndFrame = selectedModel.features.includes("Start/End");
    const supportsReferences =
      selectedModel.features.includes("Reference") ||
      selectedModel.features.includes("Multi-shots");
    const supportsAudio = selectedModel.supports.audioGeneration;

    return {
      modelId: selectedModelId,
      prompt,
      negativePrompt,
      resolution,
      draftMode,
      saveAudio,
      promptUpsampling,
      disableSafetyFilter,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      imageUrl,
      endImageUrl: supportsEndFrame ? endImageUrl : "",
      referenceImageUrls: supportsReferences ? referenceImageUrls : [],
      audioUrl: supportsAudio ? audioUrl : "",
      sourceAssetId
    };
  }

  function handleReplacePrompt() {
    if (!selectedSuggestion) return;

    setPrompt(selectedSuggestion);
    setActiveDraftId(null);
    setLastAction("Replaced the current video prompt with a suggestion.");
  }

  function handleAppendPrompt() {
    if (!selectedSuggestion) return;

    setPrompt((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return selectedSuggestion;
      return `${trimmed}, ${selectedSuggestion}`;
    });

    setActiveDraftId(null);
    setLastAction("Appended a suggestion to the current video prompt.");
  }

  function handleResetSession() {
    setSelectedModelId(defaultModel.id);
    setPrompt("");
    setNegativePrompt("");
    setResolution(defaultModel.defaultResolution ?? "720p");
    setDraftMode(false);
    setSaveAudio(true);
    setPromptUpsampling(false);
    setDisableSafetyFilter(true);
    setDuration(String(defaultModel.defaultDuration));
    setAspectRatio(defaultModel.defaultAspectRatio);
    setMotionIntensity("medium");
    setCameraMove("Slow Push In");
    setStyleStrength("medium");
    setMotionGuidance(6);
    setShotType("Wide Shot");
    setFps("24");
    setImageUrl("");
    setEndImageUrl("");
    setReferenceImageUrls([]);
    setAudioUrl("");
    setSourceAssetId("");
    setEndImageName("");
    setReferenceImageNames([]);
    setAudioName("");
    setDraftTitle("");
    setSelectedSuggestion(null);
    setActiveDraftId(null);
    setAdvancedOpen(false);
    setVideoUrl(null);
    setLastUsedSetup(null);
    setTakeCount(0);
    clearVideoStudioSessionState();
    setHasPersistedSession(false);
    setLastAction("Reset the current video studio session.");
  }

  async function handleSaveDraft() {
    if (!draftTitle.trim()) {
      alert("Please enter a draft title");
      return;
    }

    if (prompt.trim().length < 5) {
      alert("Prompt must be at least 5 characters");
      return;
    }

    setSavingDraft(true);

    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "video",
          modelId: selectedModelId,
          title: draftTitle,
          prompt,
          negativePrompt,
          resolution,
          draftMode,
          saveAudio,
          promptUpsampling,
          disableSafetyFilter,
          duration: Number(duration),
          aspectRatio,
          motionIntensity,
          cameraMove,
          styleStrength,
          motionGuidance,
          shotType,
          fps: Number(fps),
          imageUrl: imageUrl || undefined,
          sourceAssetId: sourceAssetId || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save video draft");
        setSavingDraft(false);
        return;
      }

      setDrafts((prev) => [data.draft, ...prev]);
      setActiveDraftId(data.draft.id);
      setDraftTitle("");
      setLastAction("Saved the current setup as a video draft.");
      alert("Video draft saved");
    } catch {
      setLastAction("Failed to save video draft.");
      alert("Something went wrong");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleDeleteDraft(draftId: string) {
    setDeletingDraftId(draftId);

    try {
      const res = await fetch(`/api/drafts?draftId=${draftId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete draft");
        setDeletingDraftId(null);
        return;
      }

      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));

      if (activeDraftId === draftId) {
        setActiveDraftId(null);
      }

      setLastAction("Deleted a saved video draft.");
    } catch {
      setLastAction("Failed to delete video draft.");
      alert("Something went wrong");
    } finally {
      setDeletingDraftId(null);
    }
  }

  function handleLoadDraft(draft: VideoDraft) {
    const draftModel = resolveReplicateVideoModel(draft.modelId ?? defaultModel.id);
    setSelectedModelId(
      (draft.modelId as ReplicateVideoModelId | undefined) ?? defaultModel.id
    );
    setPrompt(draft.prompt);
    setNegativePrompt(draft.negativePrompt ?? "");
    setResolution(draft.resolution ?? draftModel.defaultResolution ?? "720p");
    setDraftMode(draft.draftMode ?? false);
    setSaveAudio(draft.saveAudio ?? draftModel.supports.audioGeneration);
    setPromptUpsampling(draft.promptUpsampling ?? false);
    setDisableSafetyFilter(draft.disableSafetyFilter ?? true);
    setDuration(draft.duration != null ? String(draft.duration) : "5");
    setAspectRatio(draft.aspectRatio || "16:9");
    setMotionIntensity(draft.motionIntensity || "medium");
    setCameraMove(draft.cameraMove || "Slow Push In");
    setStyleStrength(draft.styleStrength || "medium");
    setMotionGuidance(draft.motionGuidance ?? 6);
    setShotType(draft.shotType || "Wide Shot");
    setFps(draft.fps != null ? String(draft.fps) : "24");
    setImageUrl(draft.imageUrl ?? "");
    setSourceAssetId(draft.sourceAssetId ?? "");
    setSourceImageName(draft.imageUrl ? "Saved source image" : "");
    setAdvancedOpen(true);
    setActiveDraftId(draft.id);
    setDraftTitle(draft.title);
    setSelectedSuggestion(null);
    setLastAction(`Loaded video draft "${draft.title}".`);
  }

  function handleModelChange(value: ReplicateVideoModelId) {
    const nextModel = resolveReplicateVideoModel(value);
    setSelectedModelId(value);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/suite/animate-video/${nextModel.slug}`);
    }
    const nextOptions = getVideoModelUiOptions(nextModel);
    setResolution((prev) =>
      nextOptions.resolutions.includes(prev)
        ? prev
        : nextModel.defaultResolution ?? nextOptions.resolutions[0] ?? "720p"
    );
    setAspectRatio((prev) =>
      nextOptions.aspectRatios.includes(prev) ? prev : nextModel.defaultAspectRatio
    );
    setDuration((prev) =>
      nextOptions.durations.includes(Number(prev))
        ? prev
        : String(nextModel.defaultDuration)
    );
    if (!nextModel.supports.audioGeneration) {
      setSaveAudio(false);
    } else if (!selectedModel.supports.audioGeneration) {
      setSaveAudio(true);
    }
    setActiveDraftId(null);
    setLastAction(`Selected ${nextModel.label} for the next generation.`);
  }

  async function runVideoGeneration(setup: VideoGenerationSetup, isTake = false) {
    setLoading(true);
    setGenerationProgress(4);
    setVideoUrl(null);
    setLastAction(isTake ? `Started take ${takeCount + 1}.` : "Started a new video generation.");

    try {
      const requiredCredits = await fetchVideoQuote(setup);
      setLastAction(`Estimated cost: ${requiredCredits} credits.`);

      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          modelId: setup.modelId,
          prompt: setup.prompt,
          negativePrompt: setup.negativePrompt,
          resolution: setup.resolution,
          draft: setup.draftMode,
          saveAudio: setup.saveAudio,
          promptUpsampling: setup.promptUpsampling,
          disableSafetyFilter: setup.disableSafetyFilter,
          duration: Number(setup.duration),
          aspectRatio: setup.aspectRatio,
          motionIntensity: setup.motionIntensity,
          cameraMove: setup.cameraMove,
          styleStrength: setup.styleStrength,
          motionGuidance: setup.motionGuidance,
          shotType: setup.shotType,
          fps: Number(setup.fps),
          imageUrl: setup.imageUrl || undefined,
          endImageUrl: setup.endImageUrl || undefined,
          referenceImageUrls: setup.referenceImageUrls?.length
            ? setup.referenceImageUrls
            : undefined,
          audioUrl: setup.audioUrl || undefined,
          sourceAssetId: setup.sourceAssetId || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error === "INSUFFICIENT_CREDITS"
            ? data.message || "You need more credits to run this generation."
            : data.error || "Failed to generate video"
        );
        setLoading(false);
        setGenerationProgress(0);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        setLastAction(isTake ? "Another take failed to start." : "Video generation failed to start.");
        return;
      }

      setLastUsedSetup(setup);
      setTakeCount((prev) => (isTake ? prev + 1 : 0));

      const jobId = data.jobId;

      if (data.status === "completed") {
        setVideoUrl(data.outputUrl);
        setGenerationProgress(100);
        setLoading(false);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        setLastAction(
          isTake
            ? `Take ${takeCount + 1} completed successfully.`
            : "Video generation completed successfully."
        );
        return;
      }

      if (data.status === "failed") {
        setLoading(false);
        setGenerationProgress(0);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        setLastAction(
          data.failureReason ||
            (isTake
              ? "Another take failed. You can retry with the same setup."
              : "Video generation failed. You can retry with the same setup.")
        );
        alert(data.failureReason || "Video generation failed");
        return;
      }

      const interval = setInterval(async () => {
        const statusRes = await fetch(`/api/generate/status/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          setVideoUrl(statusData.outputUrl);
          clearInterval(interval);
          setGenerationProgress(100);
          setLoading(false);
          window.dispatchEvent(new Event("vireon:credits-updated"));
          setLastAction(
            isTake
              ? `Take ${takeCount + 1} completed successfully.`
              : "Video generation completed successfully."
          );
        }

        if (statusData.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          setGenerationProgress(0);
          window.dispatchEvent(new Event("vireon:credits-updated"));
          setLastUsedSetup(setup);
          setLastAction(
            statusData.failureReason ||
              (isTake
                ? "Another take failed. You can retry with the same setup."
                : "Video generation failed. You can retry with the same setup.")
          );
          alert(statusData.failureReason || "Video generation failed");
        }
      }, 2000);
    } catch {
      setLoading(false);
      setGenerationProgress(0);
      setLastAction("Something went wrong during video generation.");
      alert("Something went wrong");
    }
  }

  async function handleSourceImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingSourceImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/image-reference", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Failed to upload source image");
        return;
      }

      setImageUrl(data.url);
      setSourceAssetId("");
      setSourceImageName(data.originalFilename || file.name);
      setActiveDraftId(null);
      setLastAction("Attached a source image for video generation.");
    } catch {
      window.alert("Failed to upload source image");
    } finally {
      setUploadingSourceImage(false);
      event.target.value = "";
    }
  }

  function handleRemoveSourceImage() {
    setImageUrl("");
    setSourceAssetId("");
    setSourceImageName("");
    setActiveDraftId(null);
    setLastAction("Removed the source image from this video setup.");
  }

  async function uploadVideoFrame(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads/image-reference", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to upload image");
    }

    return {
      url: data.url as string,
      filename: (data.originalFilename as string | undefined) || file.name,
    };
  }

  async function handleEndImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingEndImage(true);

    try {
      const uploaded = await uploadVideoFrame(file);
      setEndImageUrl(uploaded.url);
      setEndImageName(uploaded.filename);
      setActiveDraftId(null);
      setLastAction("Attached an end frame for video generation.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to upload end frame");
    } finally {
      setUploadingEndImage(false);
      event.target.value = "";
    }
  }

  function handleRemoveEndImage() {
    setEndImageUrl("");
    setEndImageName("");
    setActiveDraftId(null);
    setLastAction("Removed the end frame from this video setup.");
  }

  async function handleReferenceImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingReferenceImage(true);

    try {
      const uploaded = await uploadVideoFrame(file);
      setReferenceImageUrls((prev) => [...prev.slice(0, 3), uploaded.url]);
      setReferenceImageNames((prev) => [...prev.slice(0, 3), uploaded.filename]);
      setActiveDraftId(null);
      setLastAction("Added a reference image for this video setup.");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to upload reference image"
      );
    } finally {
      setUploadingReferenceImage(false);
      event.target.value = "";
    }
  }

  function handleRemoveReferenceImage(index: number) {
    setReferenceImageUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setReferenceImageNames((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setActiveDraftId(null);
    setLastAction("Removed a reference image from this video setup.");
  }

  async function handleAudioUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/audio-reference", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Failed to upload audio reference");
        return;
      }

      setAudioUrl(data.url);
      setAudioName(data.originalFilename || file.name);
      setSaveAudio(true);
      setActiveDraftId(null);
      setLastAction("Attached an audio reference for video generation.");
    } catch {
      window.alert("Failed to upload audio reference");
    } finally {
      setUploadingAudio(false);
      event.target.value = "";
    }
  }

  function handleRemoveAudio() {
    setAudioUrl("");
    setAudioName("");
    setActiveDraftId(null);
    setLastAction("Removed the audio reference from this video setup.");
  }

  async function handleGenerateVideo() {
    if (!prompt.trim()) return;
    await runVideoGeneration(buildCurrentSetup(), false);
  }

  async function handleGenerateAnotherTake() {
    if (!lastUsedSetup) return;
    await runVideoGeneration(lastUsedSetup, true);
  }

  return (
    <>
    <DesktopVideoCreatorPage
      onChangeMode={onChangeMode}
      selectedModelId={selectedModelId}
      selectedModel={selectedModel}
      modelOptions={selectedModelOptions}
      onModelChange={handleModelChange}
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
      imageUrl={imageUrl}
      sourceImageName={sourceImageName}
      uploadingSourceImage={uploadingSourceImage}
      onSourceImageUpload={handleSourceImageUpload}
      onRemoveSourceImage={handleRemoveSourceImage}
      endImageUrl={endImageUrl}
      endImageName={endImageName}
      uploadingEndImage={uploadingEndImage}
      onEndImageUpload={handleEndImageUpload}
      onRemoveEndImage={handleRemoveEndImage}
      referenceImageUrls={referenceImageUrls}
      referenceImageNames={referenceImageNames}
      uploadingReferenceImage={uploadingReferenceImage}
      onReferenceImageUpload={handleReferenceImageUpload}
      onRemoveReferenceImage={handleRemoveReferenceImage}
      audioUrl={audioUrl}
      audioName={audioName}
      uploadingAudio={uploadingAudio}
      onAudioUpload={handleAudioUpload}
      onRemoveAudio={handleRemoveAudio}
      duration={duration}
      onDurationChange={(value) => {
        setDuration(value);
        setActiveDraftId(null);
      }}
      aspectRatio={aspectRatio}
      onAspectRatioChange={(value) => {
        setAspectRatio(value);
        setActiveDraftId(null);
      }}
      motionIntensity={motionIntensity}
      onMotionIntensityChange={(value) => {
        setMotionIntensity(value);
        setActiveDraftId(null);
      }}
      cameraMove={cameraMove}
      onCameraMoveChange={(value) => {
        setCameraMove(value);
        setActiveDraftId(null);
      }}
        videoCost={displayVideoCost}
      videoUrl={videoUrl}
      loading={loading}
      generationProgress={generationProgress}
      canGenerate={canGenerate}
      onGenerate={handleGenerateVideo}
      canGenerateAnotherTake={canGenerateAnotherTake}
      onGenerateAnotherTake={handleGenerateAnotherTake}
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
      onSuggestionSelect={(value) => {
        setSelectedSuggestion(value);
        setLastAction("Selected a video prompt suggestion.");
      }}
      onReplacePrompt={handleReplacePrompt}
      onAppendPrompt={handleAppendPrompt}
      advancedOpen={advancedOpen}
      onToggleAdvancedOpen={() => setAdvancedOpen((prev) => !prev)}
      resolution={resolution}
      onResolutionChange={(value) => {
        setResolution(value);
        setActiveDraftId(null);
      }}
      draftMode={draftMode}
      onDraftModeChange={(value) => {
        setDraftMode(value);
        setActiveDraftId(null);
      }}
      saveAudio={saveAudio}
      onSaveAudioChange={(value) => {
        setSaveAudio(value);
        setActiveDraftId(null);
      }}
      promptUpsampling={promptUpsampling}
      onPromptUpsamplingChange={(value) => {
        setPromptUpsampling(value);
        setActiveDraftId(null);
      }}
      disableSafetyFilter={disableSafetyFilter}
      onDisableSafetyFilterChange={(value) => {
        setDisableSafetyFilter(value);
        setActiveDraftId(null);
      }}
      styleStrength={styleStrength}
      onStyleStrengthChange={(value) => {
        setStyleStrength(value);
        setActiveDraftId(null);
      }}
      motionGuidance={motionGuidance}
      onMotionGuidanceChange={(value) => {
        setMotionGuidance(value);
        setActiveDraftId(null);
      }}
      shotType={shotType}
      onShotTypeChange={(value) => {
        setShotType(value);
        setActiveDraftId(null);
      }}
      fps={fps}
      onFpsChange={(value) => {
        setFps(value);
        setActiveDraftId(null);
      }}
      takeCount={takeCount}
      activeDraftTitle={activeDraftTitle}
      hasPersistedSession={hasPersistedSession}
      lastAction={lastAction}
      onResetSession={handleResetSession}
    />

    <MobileVideoCreatorPage
      onChangeMode={onChangeMode}
      selectedModelId={selectedModelId}
      selectedModel={selectedModel}
      modelOptions={selectedModelOptions}
      onModelChange={handleModelChange}
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
      imageUrl={imageUrl}
      sourceImageName={sourceImageName}
      uploadingSourceImage={uploadingSourceImage}
      onSourceImageUpload={handleSourceImageUpload}
      onRemoveSourceImage={handleRemoveSourceImage}
      endImageUrl={endImageUrl}
      endImageName={endImageName}
      uploadingEndImage={uploadingEndImage}
      onEndImageUpload={handleEndImageUpload}
      onRemoveEndImage={handleRemoveEndImage}
      referenceImageUrls={referenceImageUrls}
      referenceImageNames={referenceImageNames}
      uploadingReferenceImage={uploadingReferenceImage}
      onReferenceImageUpload={handleReferenceImageUpload}
      onRemoveReferenceImage={handleRemoveReferenceImage}
      audioUrl={audioUrl}
      audioName={audioName}
      uploadingAudio={uploadingAudio}
      onAudioUpload={handleAudioUpload}
      onRemoveAudio={handleRemoveAudio}
      duration={duration}
      onDurationChange={(value) => {
        setDuration(value);
        setActiveDraftId(null);
      }}
      aspectRatio={aspectRatio}
      onAspectRatioChange={(value) => {
        setAspectRatio(value);
        setActiveDraftId(null);
      }}
      motionIntensity={motionIntensity}
      onMotionIntensityChange={(value) => {
        setMotionIntensity(value);
        setActiveDraftId(null);
      }}
      cameraMove={cameraMove}
      onCameraMoveChange={(value) => {
        setCameraMove(value);
        setActiveDraftId(null);
      }}
      videoCost={displayVideoCost}
      videoUrl={videoUrl}
      loading={loading}
      generationProgress={generationProgress}
      canGenerate={canGenerate}
      onGenerate={handleGenerateVideo}
      canGenerateAnotherTake={canGenerateAnotherTake}
      onGenerateAnotherTake={handleGenerateAnotherTake}
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
      onSuggestionSelect={(value) => {
        setSelectedSuggestion(value);
        setLastAction("Selected a video prompt suggestion.");
      }}
      onReplacePrompt={handleReplacePrompt}
      onAppendPrompt={handleAppendPrompt}
      advancedOpen={advancedOpen}
      onToggleAdvancedOpen={() => setAdvancedOpen((prev) => !prev)}
      resolution={resolution}
      onResolutionChange={(value) => {
        setResolution(value);
        setActiveDraftId(null);
      }}
      draftMode={draftMode}
      onDraftModeChange={(value) => {
        setDraftMode(value);
        setActiveDraftId(null);
      }}
      saveAudio={saveAudio}
      onSaveAudioChange={(value) => {
        setSaveAudio(value);
        setActiveDraftId(null);
      }}
      promptUpsampling={promptUpsampling}
      onPromptUpsamplingChange={(value) => {
        setPromptUpsampling(value);
        setActiveDraftId(null);
      }}
      disableSafetyFilter={disableSafetyFilter}
      onDisableSafetyFilterChange={(value) => {
        setDisableSafetyFilter(value);
        setActiveDraftId(null);
      }}
      styleStrength={styleStrength}
      onStyleStrengthChange={(value) => {
        setStyleStrength(value);
        setActiveDraftId(null);
      }}
      motionGuidance={motionGuidance}
      onMotionGuidanceChange={(value) => {
        setMotionGuidance(value);
        setActiveDraftId(null);
      }}
      shotType={shotType}
      onShotTypeChange={(value) => {
        setShotType(value);
        setActiveDraftId(null);
      }}
      fps={fps}
      onFpsChange={(value) => {
        setFps(value);
        setActiveDraftId(null);
      }}
      takeCount={takeCount}
      activeDraftTitle={activeDraftTitle}
      hasPersistedSession={hasPersistedSession}
      lastAction={lastAction}
      onResetSession={handleResetSession}
    />

    <section className="hidden">
      <div className="space-y-6">
        <VideoStudioStatusBar
          hasPrompt={prompt.trim().length >= 5}
          activeDraftTitle={activeDraftTitle}
          hasPersistedSession={hasPersistedSession}
          advancedSettingsOpen={advancedOpen}
          lastAction={lastAction}
        />

        <StudioCard>
          <StudioSectionTitle
            title="Create video"
            subtitle="Describe your cinematic scene, motion, and storytelling."
            action={
              <button
                type="button"
                onClick={handleResetSession}
                className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            }
          />

          <div className="space-y-5">
            <ControlGroup
              title="Generation model"
              subtitle="Choose the engine that fits your speed, polish, and audio needs."
            >
              <VideoModelSelector
                value={selectedModelId}
                onChange={handleModelChange}
              />
            </ControlGroup>

            <ControlGroup
              title="Prompt editor"
              subtitle="Define the scene, movement, lighting, and cinematic intent."
            >
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setActiveDraftId(null);
                }}
                placeholder="A cinematic drone shot over a futuristic African city..."
                className="min-h-40 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white"
              />

              <textarea
                rows={3}
                value={negativePrompt}
                onChange={(e) => {
                  setNegativePrompt(e.target.value);
                  setActiveDraftId(null);
                }}
                placeholder="Things to avoid..."
                className="mt-3 min-h-40 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white"
              />

              <div className="mt-3 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                <label className="text-xs font-medium text-white">
                  Optional image-to-video source
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedModel.supports.imageInput
                    ? `${selectedModel.label} can use a source image as a starting frame.`
                    : `${selectedModel.label} is prompt-only in the current setup.`}
                </p>

                {selectedModel.supports.imageInput ? (
                  <div className="mt-3 space-y-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-black/20 px-5 py-6 text-center transition hover:border-primary/25 hover:bg-white/5">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                        {uploadingSourceImage ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Upload className="size-5" />
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-white">
                        {uploadingSourceImage
                          ? "Uploading source image..."
                          : "Upload a source image"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        PNG, JPG, or WEBP up to 10MB. The uploaded image becomes
                        the starting frame for your video.
                      </p>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(event) =>
                          void handleSourceImageUpload(event)
                        }
                      />
                    </label>

                    {imageUrl ? (
                      <div className="overflow-hidden rounded-[1.25rem] border border-primary/20 bg-black/30">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              Source image attached
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sourceImageName || "Uploaded source image"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveSourceImage}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                          >
                            <X className="size-3" />
                            Remove
                          </button>
                        </div>

                        <img
                          src={imageUrl}
                          alt="Source image preview"
                          className="max-h-56 w-full object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
                    This model is currently running in prompt-only mode in the
                    studio. Switch to a model with image-to-video support to
                    attach a starting frame.
                  </div>
                )}
              </div>

              {hasPersistedSession ? (
                <div className="mt-3 rounded-[1rem] border border-primary/20 bg-primary/10 px-4 py-3 text-xs text-primary">
                  Your current video setup is saved locally and will be
                  restored after refresh.
                </div>
              ) : null}
            </ControlGroup>

            <PromptTemplatesPanel
              type="video"
              onUseTemplate={(template) => {
                setPrompt(template.prompt);
                setNegativePrompt(template.negativePrompt ?? "");
                setActiveDraftId(null);
                setLastAction("Loaded a video prompt template.");
              }}
            />

            <div className="grid gap-5 xl:grid-cols-2">
              <ControlGroup
                title="Scene format"
                subtitle="Shape the delivery canvas and clip length."
              >
                <div className="space-y-4">
                  <VideoAspectRatioSelector
                    value={aspectRatio}
                    options={videoAspectRatios.filter((item) =>
                      selectedModelOptions.aspectRatios.includes(item.value)
                    )}
                    onChange={(value) => {
                      setAspectRatio(value);
                      setActiveDraftId(null);
                    }}
                  />
                  <VideoDurationSelector
                    value={duration}
                    options={videoDurations.filter((item) =>
                      selectedModelOptions.durations.includes(Number(item.value))
                    )}
                    onChange={(value) => {
                      setDuration(value);
                      setActiveDraftId(null);
                    }}
                  />
                </div>
              </ControlGroup>

              <ControlGroup
                title="Motion language"
                subtitle="Guide movement energy and camera direction."
              >
                <div className="space-y-4">
                  <MotionIntensitySelector
                    value={motionIntensity}
                    onChange={(value) => {
                      setMotionIntensity(value);
                      setActiveDraftId(null);
                    }}
                  />
                  <CameraMoveSelector
                    value={cameraMove}
                    onChange={(value) => {
                      setCameraMove(value);
                      setActiveDraftId(null);
                    }}
                  />
                </div>
              </ControlGroup>
            </div>
          </div>
        </StudioCard>

        <VideoAdvancedSettings
          selectedModel={selectedModel}
          open={advancedOpen}
          onToggleOpen={() => setAdvancedOpen((prev) => !prev)}
          resolution={resolution}
          resolutionOptions={videoResolutionOptions.filter((item) =>
            selectedModelOptions.resolutions.includes(item.value)
          )}
          onResolutionChange={(value) => {
            setResolution(value);
            setActiveDraftId(null);
          }}
          draftMode={draftMode}
          onDraftModeChange={(value) => {
            setDraftMode(value);
            setActiveDraftId(null);
          }}
          saveAudio={saveAudio}
          onSaveAudioChange={(value) => {
            setSaveAudio(value);
            setActiveDraftId(null);
          }}
          promptUpsampling={promptUpsampling}
          onPromptUpsamplingChange={(value) => {
            setPromptUpsampling(value);
            setActiveDraftId(null);
          }}
          disableSafetyFilter={disableSafetyFilter}
          onDisableSafetyFilterChange={(value) => {
            setDisableSafetyFilter(value);
            setActiveDraftId(null);
          }}
          styleStrength={styleStrength}
          onStyleStrengthChange={(value) => {
            setStyleStrength(value);
            setActiveDraftId(null);
          }}
          motionGuidance={motionGuidance}
          onMotionGuidanceChange={(value) => {
            setMotionGuidance(value);
            setActiveDraftId(null);
          }}
          shotType={shotType}
          onShotTypeChange={(value) => {
            setShotType(value);
            setActiveDraftId(null);
          }}
          fps={fps}
          onFpsChange={(value) => {
            setFps(value);
            setActiveDraftId(null);
          }}
        />

        <VideoDraftsPanel
          drafts={drafts}
          activeDraftId={activeDraftId}
          deletingDraftId={deletingDraftId}
          onLoadDraft={handleLoadDraft}
          onDeleteDraft={handleDeleteDraft}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-4 xl:sticky xl:top-24 xl:space-y-6">
          <StudioCard className="p-0 overflow-hidden">
            <div className="flex justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-sm text-white">Video preview</p>
                <p className="text-xs text-muted-foreground">
                  Your generated scene will appear here
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary sm:px-3 sm:text-xs">
                Video
              </span>
            </div>

            <div className="p-5">
              <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-xl overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_24%),linear-gradient(135deg,#111827,#1f2937,#0f172a)]">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    {loading ? (
                      <Loader2 className="mx-auto size-8 animate-spin text-white/60" />
                    ) : (
                      <Clapperboard className="mx-auto opacity-40" />
                    )}
                    <p className="mt-3 text-sm text-white">
                      {loading
                        ? "Generating your video..."
                        : "Your generated scene will appear here"}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-5">
                <ControlGroup
                  title="Current setup"
                  subtitle="Live summary of the active cinematic configuration."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Sparkles className="size-4 text-primary" />
                        Model
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {selectedModel.label}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Film className="size-4 text-primary" />
                        Duration
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {duration}s
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Video className="size-4 text-primary" />
                        Aspect ratio
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {aspectRatio}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Move3d className="size-4 text-primary" />
                        Motion direction
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {cameraMove}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Music4 className="size-4 text-primary" />
                        Audio mode
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {selectedModel.supports.audioGeneration
                          ? "Audio-capable"
                          : "Video-only"}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Sparkles className="size-4 text-primary" />
                        Scene energy
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {motionIntensity}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Model: {selectedModel.label}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Duration: {duration}s
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Ratio: {aspectRatio}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Motion: {motionIntensity}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Camera: {cameraMove}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Shot: {shotType}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      FPS: {fps}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Style: {styleStrength}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Motion guide: {motionGuidance}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      Cost: {videoCost} credits
                    </span>
                    {selectedModel.supports.resolutionControl ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        Resolution: {resolution}
                      </span>
                    ) : null}
                    {selectedModel.supports.draftMode && draftMode ? (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
                        Draft mode on
                      </span>
                    ) : null}
                    {selectedModel.supports.audioGeneration ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        Audio: {saveAudio ? "Save" : "Off"}
                      </span>
                    ) : null}
                    {selectedModel.defaultResolution ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        Default res: {selectedModel.defaultResolution}
                      </span>
                    ) : null}
                    {imageUrl ? (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
                        Image-to-video source attached
                      </span>
                    ) : null}
                    {activeDraftId ? (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
                        Draft loaded
                      </span>
                    ) : null}
                    {takeCount > 0 ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                        Take {takeCount}
                      </span>
                    ) : null}
                  </div>
                </ControlGroup>

                <ControlGroup
                  title="Save reusable setup"
                  subtitle="Turn your current cinematic configuration into a reusable draft."
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Video draft title"
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
                  subtitle="Generate a new clip or quickly request another take from the same setup."
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => setAdvancedOpen((prev) => !prev)}
                      className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Settings2 className="mr-2 size-4" />
                      {advancedOpen ? "Hide settings" : "Advanced"}
                    </Button>

                    <Button
                      disabled={!canGenerate}
                      onClick={handleGenerateVideo}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {loading ? "Generating..." : "Generate video"}
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      variant="outline"
                      disabled={!canGenerateAnotherTake}
                      onClick={handleGenerateAnotherTake}
                      className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 disabled:opacity-60"
                    >
                      <RefreshCcw className="mr-2 size-4" />
                      Generate another take
                    </Button>

                    <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground">
                      {lastUsedSetup
                        ? "Uses your last successful or failed video setup"
                        : "Run one video generation to unlock retries, takes, and image-to-video iterations"}
                    </div>
                  </div>
                </ControlGroup>
              </div>
            </div>
          </StudioCard>

          <StudioCard>
            <StudioSectionTitle
              title="Video prompt suggestions"
              subtitle="Boost creativity with cinematic starting points."
            />

            <VideoPromptSuggestions
              selectedPrompt={selectedSuggestion}
              onSelect={(value) => {
                setSelectedSuggestion(value);
                setLastAction("Selected a video prompt suggestion.");
              }}
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
