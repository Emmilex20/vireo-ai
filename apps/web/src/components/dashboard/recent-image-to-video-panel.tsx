"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, WandSparkles } from "lucide-react";
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
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-white/10" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-32 rounded-[1.4rem] bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <WandSparkles className="size-3.5" />
            Continue creating
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">
            Recent image-to-video runs
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Jump back into your latest motion ideas without rebuilding the setup.
          </p>
        </div>

        <Link
          href="/assets"
          className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 sm:inline-flex"
        >
          View assets
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {jobs.slice(0, 3).map((job) => (
          <article
            key={job.id}
            className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20"
          >
            <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[108px_1fr]">
              <div className="relative h-full min-h-28 bg-black/30">
                {job.sourceImageUrl ? (
                  <img
                    src={job.sourceImageUrl}
                    alt="Source"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No image
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="line-clamp-2 text-sm font-medium text-white">
                  {job.prompt || "Image-to-video generation"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {job.status}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleContinue(job)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary transition hover:bg-primary/15"
                >
                  Continue
                  <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
