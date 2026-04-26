"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Job = {
  id: string;
  prompt?: string | null;
  negativePrompt?: string | null;
  status: string;
  outputUrl?: string | null;
  sourceImageUrl?: string | null;
  sourceAssetId?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  createdAt: string;
};

export function RecentImageToVideoPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  function handleContinue(job: Job) {
    const payload = {
      prompt: job.prompt ?? "",
      negativePrompt: job.negativePrompt ?? "",
      duration: String(job.duration ?? 5),
      aspectRatio: job.aspectRatio ?? "16:9",
      motionIntensity: job.motionIntensity ?? "medium",
      cameraMove: job.cameraMove ?? "Slow Push In",
      styleStrength: job.styleStrength ?? "medium",
      motionGuidance: job.motionGuidance ?? 6,
      shotType: job.shotType ?? "Wide Shot",
      fps: String(job.fps ?? 24),
      imageUrl: job.sourceImageUrl ?? "",
      sourceAssetId: job.sourceAssetId ?? ""
    };

    sessionStorage.setItem(
      "vireon_video_studio_reuse_payload",
      JSON.stringify(payload)
    );
    sessionStorage.setItem("vireon_studio_open_mode", "video");

    window.location.href = "/studio";
  }

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/dashboard/image-to-video");
        const data = await res.json();
        setJobs(data.jobs ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadJobs();
  }, []);

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="h-6 w-56 rounded bg-white/10" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 rounded-[1.5rem] bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Recent image-to-video
          </div>

          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-white">
            Your latest animated image workflows
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Continue iterating from source images into cinematic video outputs.
          </p>
        </div>

        <Link href="/assets" className="text-sm text-primary">
          View all assets
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20"
          >
            <div className="grid grid-cols-2">
              <div className="relative h-36 bg-black/30">
                {job.sourceImageUrl ? (
                  <img
                    src={job.sourceImageUrl}
                    alt="Source"
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
                  Source
                </span>
              </div>

              <div className="relative h-36 bg-black/30">
                {job.outputUrl ? (
                  <video
                    src={job.outputUrl}
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    {job.status}
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
                  Video
                </span>
              </div>
            </div>

            <div className="p-4">
              <p className="line-clamp-2 text-sm font-medium text-white">
                {job.prompt || "Image-to-video generation"}
              </p>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{job.status}</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <button
                type="button"
                onClick={() => handleContinue(job)}
                className="mt-4 w-full rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"
              >
                Continue workflow
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
