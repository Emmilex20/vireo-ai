"use client";

import { Plus, Video } from "lucide-react";
import { useEffect, useState } from "react";

type VideoProject = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  updatedAt: string;
  _count?: {
    scenes: number;
  };
};

export function VideoProjectsPageClient() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/video-projects");
        const data = await res.json();
        setProjects(data.projects ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  async function handleCreate() {
    setCreating(true);

    try {
      const res = await fetch("/api/video-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create project");
        return;
      }

      window.location.href = `/video-projects/${data.project.id}`;
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Video className="size-3.5" />
            Multi-scene video
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Video projects
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            Build longer AI videos scene by scene, then assemble them into a
            complete story.
          </p>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <h2 className="text-lg font-semibold text-white">Create new project</h2>

          <div className="mt-4 grid gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title e.g. The Lost Kingdom"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short story direction or concept..."
              rows={3}
              className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || title.trim().length < 3}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15 disabled:opacity-60"
            >
              <Plus className="size-4" />
              {creating ? "Creating..." : "Create project"}
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No video projects yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first multi-scene project above.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/video-projects/${project.id}`}
                className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 transition hover:bg-white/5"
              >
                <p className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                  {project.title}
                </p>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {project.description || "No description yet."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {project._count?.scenes ?? 0} scenes
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {project.status}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
