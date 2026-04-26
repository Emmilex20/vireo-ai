"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Film,
  Loader2,
  Move3d,
  RefreshCcw,
  RotateCcw,
  Settings2,
  Sparkles,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { VideoStudioStatusBar } from "./video-studio-status-bar";
import { StudioCard } from "./studio-card";
import { ControlGroup } from "./control-group";
import {
  clearVideoStudioSessionState,
  loadVideoStudioSessionState,
  saveVideoStudioSessionState
} from "./session-storage";
import { hasMeaningfulVideoStudioState } from "./video-session-utils";
import type { VideoGenerationSetup, VideoReusePayload } from "./video-types";

type VideoDraft = {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  updatedAt: string;
};

export function VideoStudioComposer() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceAssetId, setSourceAssetId] = useState("");
  const [duration, setDuration] = useState("5");
  const [aspectRatio, setAspectRatio] = useState("16:9");
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lastUsedSetup, setLastUsedSetup] = useState<VideoGenerationSetup | null>(null);
  const [takeCount, setTakeCount] = useState(0);

  const canGenerate = useMemo(() => prompt.trim().length >= 5 && !loading, [prompt, loading]);
  const canGenerateAnotherTake = useMemo(
    () => !!lastUsedSetup && !loading,
    [lastUsedSetup, loading]
  );

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

      setPrompt(payload.prompt ?? "");
      setNegativePrompt(payload.negativePrompt ?? "");
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
  }, []);

  useEffect(() => {
    if (!sessionHydrated) return;

    const persisted = loadVideoStudioSessionState();
    if (!persisted) {
      setHasPersistedSession(false);
      return;
    }

    setPrompt((prev) => prev || persisted.prompt || "");
    setNegativePrompt((prev) => prev || persisted.negativePrompt || "");
    setDuration((prev) => prev || persisted.duration || "5");
    setAspectRatio((prev) => prev || persisted.aspectRatio || "16:9");
    setMotionIntensity((prev) => prev || persisted.motionIntensity || "medium");
    setCameraMove((prev) => prev || persisted.cameraMove || "Slow Push In");
    setStyleStrength((prev) => prev || persisted.styleStrength || "medium");
    setMotionGuidance(persisted.motionGuidance ?? 6);
    setShotType((prev) => prev || persisted.shotType || "Wide Shot");
    setFps((prev) => prev || persisted.fps || "24");
    setImageUrl((prev) => prev || persisted.imageUrl || "");
    setSourceAssetId((prev) => prev || persisted.sourceAssetId || "");
    setDraftTitle((prev) => prev || persisted.draftTitle || "");
    setHasPersistedSession(true);
    setLastAction((prev) => prev ?? "Restored unfinished video studio session.");
  }, [sessionHydrated]);

  useEffect(() => {
    if (!sessionHydrated) return;

    const snapshot = {
      prompt,
      negativePrompt,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      imageUrl,
      sourceAssetId,
      draftTitle
    };

    saveVideoStudioSessionState(snapshot);
    setHasPersistedSession(hasMeaningfulVideoStudioState(snapshot));
  }, [
    sessionHydrated,
    prompt,
    negativePrompt,
    duration,
    aspectRatio,
    motionIntensity,
    cameraMove,
    styleStrength,
    motionGuidance,
    shotType,
    fps,
    imageUrl,
    sourceAssetId,
    draftTitle
  ]);

  function buildCurrentSetup(): VideoGenerationSetup {
    return {
      prompt,
      negativePrompt,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      imageUrl,
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
    setPrompt("");
    setNegativePrompt("");
    setDuration("5");
    setAspectRatio("16:9");
    setMotionIntensity("medium");
    setCameraMove("Slow Push In");
    setStyleStrength("medium");
    setMotionGuidance(6);
    setShotType("Wide Shot");
    setFps("24");
    setImageUrl("");
    setSourceAssetId("");
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
          title: draftTitle,
          prompt,
          negativePrompt,
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
    setPrompt(draft.prompt);
    setNegativePrompt(draft.negativePrompt ?? "");
    setDuration(draft.duration != null ? String(draft.duration) : "5");
    setAspectRatio(draft.aspectRatio || "16:9");
    setMotionIntensity(draft.motionIntensity || "medium");
    setCameraMove(draft.cameraMove || "Slow Push In");
    setStyleStrength(draft.styleStrength || "medium");
    setMotionGuidance(draft.motionGuidance ?? 6);
    setShotType(draft.shotType || "Wide Shot");
    setFps(draft.fps != null ? String(draft.fps) : "24");
    setAdvancedOpen(true);
    setActiveDraftId(draft.id);
    setDraftTitle(draft.title);
    setSelectedSuggestion(null);
    setLastAction(`Loaded video draft "${draft.title}".`);
  }

  async function runVideoGeneration(setup: VideoGenerationSetup, isTake = false) {
    setLoading(true);
    setVideoUrl(null);
    setLastAction(isTake ? `Started take ${takeCount + 1}.` : "Started a new video generation.");

    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: setup.prompt,
          negativePrompt: setup.negativePrompt,
          duration: Number(setup.duration),
          aspectRatio: setup.aspectRatio,
          motionIntensity: setup.motionIntensity,
          cameraMove: setup.cameraMove,
          styleStrength: setup.styleStrength,
          motionGuidance: setup.motionGuidance,
          shotType: setup.shotType,
          fps: Number(setup.fps),
          imageUrl: setup.imageUrl || undefined,
          sourceAssetId: setup.sourceAssetId || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to generate video");
        setLoading(false);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        setLastAction(isTake ? "Another take failed to start." : "Video generation failed to start.");
        return;
      }

      setLastUsedSetup(setup);
      setTakeCount((prev) => (isTake ? prev + 1 : 0));

      const jobId = data.jobId;

      const interval = setInterval(async () => {
        const statusRes = await fetch(`/api/generate/status/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          setVideoUrl(statusData.outputUrl);
          clearInterval(interval);
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
      setLastAction("Something went wrong during video generation.");
      alert("Something went wrong");
    }
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
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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

                <input
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setActiveDraftId(null);
                  }}
                  placeholder="Paste an image URL to animate it..."
                  className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />

                {imageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-[1.25rem] border border-primary/20 bg-black/30">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                      <p className="text-xs font-medium text-primary">
                        Source image attached
                      </p>

                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-xs text-muted-foreground hover:text-white"
                      >
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
                    onChange={(value) => {
                      setAspectRatio(value);
                      setActiveDraftId(null);
                    }}
                  />
                  <VideoDurationSelector
                    value={duration}
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
          open={advancedOpen}
          onToggleOpen={() => setAdvancedOpen((prev) => !prev)}
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
        <div className="sticky top-24 space-y-6">
          <StudioCard className="p-0 overflow-hidden">
            <div className="border-b border-white/10 p-5 flex justify-between">
              <div>
                <p className="text-sm text-white">Video preview</p>
                <p className="text-xs text-muted-foreground">
                  Your generated scene will appear here
                </p>
              </div>
              <span className="text-xs text-primary">Video</span>
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
                      Cost: 40 credits
                    </span>
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
  );
}
