"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PROJECT_EXPORT_COSTS } from "@/lib/billing/project-export-costs";
import { SCENE_GENERATION_COSTS } from "@/lib/billing/scene-costs";
import { StoryboardTimeline } from "./storyboard-timeline";

type Scene = {
  id: string;
  order: number;
  title?: string | null;
  prompt: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  status: string;
  failureReason?: string | null;
};

type VideoProject = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  exportStatus?: string | null;
  exportAttemptId?: string | null;
  exportFailureReason?: string | null;
  exportUrl?: string | null;
  exportedAt?: string | null;
  exports?: {
    id: string;
    attemptId: string;
    status: string;
    exportUrl?: string | null;
    failureReason?: string | null;
    creditsUsed: number;
    createdAt: string;
    completedAt?: string | null;
  }[];
  scenes: Scene[];
};

const ACTIVE_SCENE_STATUSES = [
  "queued_image",
  "generating_image",
  "queued_video",
  "generating_video"
];

function hasActiveScenes(project: VideoProject | null) {
  if (!project) return false;

  const activeScenes = project.scenes.some((scene) =>
    ACTIVE_SCENE_STATUSES.includes(scene.status)
  );

  const activeExport = ["queued", "processing"].includes(
    project.exportStatus ?? ""
  );

  return activeScenes || activeExport;
}

export function VideoProjectDetailClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [exportsEnabled, setExportsEnabled] = useState(true);
  const [newSceneTitle, setNewSceneTitle] = useState("");
  const [newScenePrompt, setNewScenePrompt] = useState("");
  const [creatingScene, setCreatingScene] = useState(false);
  const [savingSceneId, setSavingSceneId] = useState<string | null>(null);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [publishingExport, setPublishingExport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void reloadProject();
  }, [projectId]);

  useEffect(() => {
    async function loadBackgroundMode() {
      try {
        const res = await fetch("/api/background-mode");
        const data = await res.json();
        setExportsEnabled(data.exportsEnabled !== false);
      } catch {
        setExportsEnabled(true);
      }
    }

    void loadBackgroundMode();
  }, []);

  async function reloadProject() {
    try {
      const res = await fetch(`/api/video-projects/${projectId}`);
      const data = await res.json();

      if (res.ok) {
        setProject(data.project);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasActiveScenes(project)) return;

    const interval = setInterval(() => {
      void reloadProject();
    }, 5000);

    return () => clearInterval(interval);
  }, [project]);

  async function saveSceneOrder(nextScenes: Scene[]) {
    if (!project) return;

    const res = await fetch(`/api/video-projects/${project.id}/scenes/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sceneIds: nextScenes.map((scene) => scene.id)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to reorder scenes");
      await reloadProject();
      return;
    }

    setProject(data.project);
  }

  function moveScene(sceneId: string, direction: "up" | "down") {
    if (!project) return;

    const currentIndex = project.scenes.findIndex((scene) => scene.id === sceneId);

    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;

    const nextScenes = [...project.scenes];
    const [removed] = nextScenes.splice(currentIndex, 1);

    if (!removed) return;

    nextScenes.splice(targetIndex, 0, removed);

    setProject({
      ...project,
      scenes: nextScenes.map((scene, index) => ({
        ...scene,
        order: index + 1
      }))
    });

    void saveSceneOrder(nextScenes);
  }

  async function handleCreateScene() {
    if (!project) return;

    setCreatingScene(true);

    try {
      const res = await fetch(`/api/video-projects/${project.id}/scenes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newSceneTitle,
          prompt: newScenePrompt
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create scene");
        return;
      }

      setProject((prev) =>
        prev
          ? {
              ...prev,
              scenes: [...prev.scenes, data.scene]
            }
          : prev
      );

      setNewSceneTitle("");
      setNewScenePrompt("");
    } finally {
      setCreatingScene(false);
    }
  }

  async function handleUpdateScene(scene: Scene) {
    setSavingSceneId(scene.id);

    try {
      const res = await fetch(`/api/video-scenes/${scene.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: scene.title,
          prompt: scene.prompt
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update scene");
        return;
      }

      setProject((prev) =>
        prev
          ? {
              ...prev,
              scenes: prev.scenes.map((item) =>
                item.id === scene.id ? data.scene : item
              )
            }
          : prev
      );
    } finally {
      setSavingSceneId(null);
    }
  }

  async function handleDeleteScene(sceneId: string) {
    const confirmed = window.confirm("Delete this scene?");

    if (!confirmed) return;

    const res = await fetch(`/api/video-scenes/${sceneId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete scene");
      return;
    }

    setProject(data.project);
  }

  async function handleGenerateSceneImage(sceneId: string) {
    setGeneratingSceneId(sceneId);

    try {
      const res = await fetch(`/api/video-scenes/${sceneId}/generate-image`, {
        method: "POST"
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to generate scene image");
        return;
      }

      window.dispatchEvent(new Event("vireon:credits-updated"));
      await reloadProject();
    } finally {
      setGeneratingSceneId(null);
    }
  }

  async function handleGenerateSceneVideo(sceneId: string) {
    setGeneratingSceneId(sceneId);

    try {
      const res = await fetch(`/api/video-scenes/${sceneId}/generate-video`, {
        method: "POST"
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to generate scene video");
        return;
      }

      window.dispatchEvent(new Event("vireon:credits-updated"));
      await reloadProject();
    } finally {
      setGeneratingSceneId(null);
    }
  }

  async function handleExportProject() {
    if (!project) return;

    setExporting(true);

    try {
      const res = await fetch(`/api/video-projects/${project.id}/export`, {
        method: "POST"
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to export project");
        return;
      }

      alert(data.message || "Export queued");
      window.dispatchEvent(new Event("vireon:credits-updated"));
      await reloadProject();
    } finally {
      setExporting(false);
    }
  }

  async function handlePublishExport() {
    if (!project?.exportUrl) return;

    setPublishingExport(true);

    try {
      const res = await fetch(
        `/api/video-projects/${project.id}/publish-export`,
        {
          method: "POST"
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to publish export");
        return;
      }

      alert("Final video published to explore.");
      window.location.href = "/explore";
    } finally {
      setPublishingExport(false);
    }
  }

  function updateLocalScene(sceneId: string, patch: Partial<Scene>) {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            scenes: prev.scenes.map((scene) =>
              scene.id === sceneId ? { ...scene, ...patch } : scene
            )
          }
        : prev
    );
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white">Project not found</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <a href="/video-projects" className="text-sm text-primary">
          {"<- Back to projects"}
        </a>

        <h1 className="mt-5 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          {project.title}
        </h1>

        <button
          type="button"
          onClick={handleExportProject}
          disabled={
            exporting ||
            !exportsEnabled ||
            project.scenes.every((scene) => !scene.videoUrl)
          }
          className="mt-5 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15 disabled:opacity-50"
        >
          {exporting
            ? "Queuing export..."
            : project.exportStatus === "failed"
              ? `Retry export - ${PROJECT_EXPORT_COSTS.combinedVideo} credits`
              : project.exportUrl
                ? `Export again - ${PROJECT_EXPORT_COSTS.combinedVideo} credits`
                : `Export combined video - ${PROJECT_EXPORT_COSTS.combinedVideo} credits`}
        </button>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          {project.description || "No description yet."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
            {project.scenes.length} scenes
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
            {project.status}
          </span>
          {project.exportStatus ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
              Export: {project.exportStatus}
            </span>
          ) : null}
          {project.exportAttemptId ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
              Attempt: {project.exportAttemptId.slice(-8)}
            </span>
          ) : null}
        </div>

        {["queued", "processing"].includes(project.exportStatus ?? "") ? (
          <p className="mt-3 text-xs text-primary">
            Your final video export is running. This page will refresh
            automatically.
          </p>
        ) : null}

        {!exportsEnabled ? (
          <p className="mt-3 text-xs text-amber-400">
            Final export is disabled while the app is running in inline beta
            mode. An admin can switch to worker mode later.
          </p>
        ) : null}

        {project.exportFailureReason ? (
          <div className="mt-4 rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
            {project.exportFailureReason}
          </div>
        ) : null}

        {project.exportUrl ? (
          <div className="mt-6 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-white">
              Final exported video
            </p>
            <video
              src={project.exportUrl}
              controls
              className="mt-3 max-h-[420px] w-full rounded-[1rem] object-cover"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={project.exportUrl}
                download
                className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15"
              >
                Download video
              </a>

              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(project.exportUrl!)}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Copy video link
              </button>

              <button
                type="button"
                onClick={handlePublishExport}
                disabled={publishingExport}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-400 transition hover:bg-emerald-500/15 disabled:opacity-60"
              >
                {publishingExport ? "Publishing..." : "Publish to gallery"}
              </button>
            </div>

            {project.exportStatus === "completed" ? (
              <p className="mt-3 text-xs text-emerald-400">
                Export completed successfully. You can download or share the
                final video.
              </p>
            ) : null}
          </div>
        ) : null}

        {project.exports && project.exports.length > 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold text-white">Export history</h2>

            <div className="mt-4 grid gap-3">
              {project.exports.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Attempt {item.attemptId.slice(-8)} · {item.status}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.creditsUsed} credits ·{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>

                      {item.failureReason ? (
                        <p className="mt-2 text-xs text-red-400">
                          {item.failureReason}
                        </p>
                      ) : null}
                    </div>

                    {item.exportUrl ? (
                      <a
                        href={item.exportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary"
                      >
                        Open export
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <StoryboardTimeline scenes={project.scenes} />

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <h2 className="text-lg font-semibold text-white">Add scene</h2>

          <div className="mt-4 grid gap-3">
            <input
              value={newSceneTitle}
              onChange={(e) => setNewSceneTitle(e.target.value)}
              placeholder="Scene title e.g. Opening shot"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <textarea
              value={newScenePrompt}
              onChange={(e) => setNewScenePrompt(e.target.value)}
              rows={4}
              placeholder="Describe this scene..."
              className="min-h-40 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={handleCreateScene}
              disabled={creatingScene || newScenePrompt.trim().length < 5}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15 disabled:opacity-60"
            >
              <Plus className="size-4" />
              {creatingScene ? "Adding..." : "Add scene"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {project.scenes.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
              <p className="text-lg font-medium text-white">No scenes yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first scene above.
              </p>
            </div>
          ) : (
            project.scenes.map((scene) => (
              <article
                key={scene.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                        Scene {scene.order}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                        {scene.status.replaceAll("_", " ")}
                      </span>

                      <div className="ml-auto flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveScene(scene.id, "up")}
                          disabled={scene.order === 1}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:opacity-40"
                        >
                          <ArrowUp className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveScene(scene.id, "down")}
                          disabled={scene.order === project.scenes.length}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:opacity-40"
                        >
                          <ArrowDown className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteScene(scene.id)}
                          className="rounded-full border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/15"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <input
                      value={scene.title ?? ""}
                      onChange={(e) =>
                        updateLocalScene(scene.id, {
                          title: e.target.value
                        })
                      }
                      placeholder="Scene title"
                      className="mt-4 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    />

                    <textarea
                      value={scene.prompt}
                      onChange={(e) =>
                        updateLocalScene(scene.id, {
                          prompt: e.target.value
                        })
                      }
                      rows={4}
                      placeholder="Scene prompt"
                      className="mt-3 min-h-40 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    />

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {scene.imageUrl ? (
                        <img
                          src={scene.imageUrl}
                          alt={scene.title || "Scene image"}
                          className="h-48 w-full rounded-[1rem] object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-[1rem] border border-dashed border-white/10 bg-black/20 text-sm text-muted-foreground">
                          No scene image yet
                        </div>
                      )}

                      {scene.videoUrl ? (
                        <video
                          src={scene.videoUrl}
                          controls
                          className="h-48 w-full rounded-[1rem] object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-[1rem] border border-dashed border-white/10 bg-black/20 text-sm text-muted-foreground">
                          No scene video yet
                        </div>
                      )}
                    </div>

                    {ACTIVE_SCENE_STATUSES.includes(scene.status) ? (
                      <p className="mt-3 text-xs text-primary">
                        Scene generation is running. This page will refresh
                        automatically.
                      </p>
                    ) : null}

                    {scene.failureReason ? (
                      <div className="mt-3 rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                        {scene.failureReason}
                      </div>
                    ) : null}

                    {scene.status === "image_failed" ||
                    scene.status === "video_failed" ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        You can retry this scene. If credits were deducted and
                        the generation failed, the refund system will return
                        them automatically.
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleGenerateSceneImage(scene.id)}
                        disabled={generatingSceneId === scene.id}
                        className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/15 disabled:opacity-60"
                      >
                        {generatingSceneId === scene.id
                          ? "Generating..."
                          : scene.status === "image_failed"
                            ? `Retry scene image - ${SCENE_GENERATION_COSTS.image} credits`
                            : scene.imageUrl
                              ? `Regenerate scene image - ${SCENE_GENERATION_COSTS.image} credits`
                              : `Generate scene image - ${SCENE_GENERATION_COSTS.image} credits`}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenerateSceneVideo(scene.id)}
                        disabled={generatingSceneId === scene.id || !scene.imageUrl}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                      >
                        {generatingSceneId === scene.id
                          ? "Generating..."
                          : scene.status === "video_failed"
                            ? `Retry scene video - ${SCENE_GENERATION_COSTS.video} credits`
                            : scene.videoUrl
                              ? `Regenerate scene video - ${SCENE_GENERATION_COSTS.video} credits`
                              : `Generate scene video - ${SCENE_GENERATION_COSTS.video} credits`}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateScene(scene)}
                    disabled={savingSceneId === scene.id}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15 disabled:opacity-60"
                  >
                    <Save className="size-4" />
                    {savingSceneId === scene.id ? "Saving..." : "Save scene"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
