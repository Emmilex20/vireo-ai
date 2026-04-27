"use client";

import { useEffect, useRef, useState } from "react";

type VideoAssetCardProps = {
  id: string;
  title?: string | null;
  prompt?: string | null;
  fileUrl: string;
  detailHref?: string;
  posterUrl?: string | null;
  createdAt: string;
  isPublic?: boolean;
  sourceImageUrl?: string | null;
};

export function VideoAssetCard({
  id,
  title,
  prompt,
  fileUrl,
  detailHref,
  posterUrl,
  createdAt,
  isPublic = false,
  sourceImageUrl,
}: VideoAssetCardProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(isPublic);
  const [previewActive, setPreviewActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  function startPreview() {
    setPreviewActive(true);
  }

  function stopPreview() {
    setPreviewActive(false);
  }

  function togglePreview(event: React.MouseEvent) {
    event.stopPropagation();

    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      setPreviewActive(true);
      void videoRef.current.play().catch(() => undefined);
      return;
    }

    setPreviewActive(false);
    videoRef.current.pause();
  }

  useEffect(() => {
    if (!videoRef.current) return;

    if (previewActive) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        videoRef.current.load();
        return;
      }

      void videoRef.current.play().catch(() => undefined);
      return;
    }

    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, [previewActive]);

  async function handlePublish() {
    if (published) return;

    setPublishing(true);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: id,
          caption: prompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Failed to publish");
        setPublishing(false);
        return;
      }

      setPublished(true);
    } catch {
      window.alert("Something went wrong");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c1116] shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
      {sourceImageUrl ? (
        <span className="absolute left-4 top-4 z-20 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
          Image-to-video
        </span>
      ) : null}

      <div
        className="group relative aspect-[4/3] overflow-hidden bg-black/30"
        onMouseEnter={startPreview}
        onMouseLeave={stopPreview}
      >
        {detailHref ? (
          <a
            href={detailHref}
            className="absolute inset-0 z-10"
            aria-label={title || prompt || "Open generated video"}
          />
        ) : null}

        <video
          ref={videoRef}
          src={fileUrl}
          muted
          loop
          playsInline
          autoPlay={previewActive}
          preload={previewActive ? "auto" : "metadata"}
          poster={posterUrl ?? undefined}
          onLoadedData={() => {
            if (!previewActive || !videoRef.current) return;
            void videoRef.current.play().catch(() => undefined);
          }}
          onCanPlay={() => {
            if (!previewActive || !videoRef.current) return;
            void videoRef.current.play().catch(() => undefined);
          }}
          onClick={togglePreview}
          className="relative z-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_24%),linear-gradient(180deg,rgba(9,14,22,0.06),rgba(9,14,22,0.12)_35%,rgba(9,14,22,0.58)_72%,rgba(9,14,22,0.84)_100%)]" />

        <span className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
          {previewActive ? "Playing" : "Video"}
        </span>

        <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-slate-200 backdrop-blur">
          {previewActive ? "Motion preview active" : "Hover or tap to preview"}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-white">
          {detailHref ? (
            <a href={detailHref} className="transition hover:text-primary">
              {title || "Generated video"}
            </a>
          ) : (
            title || "Generated video"
          )}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
          {prompt || "No prompt stored"}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            {new Date(createdAt).toLocaleDateString()}
          </span>

          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
            Motion clip
          </span>

          {published ? (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
              Published
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              Private
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {published ? "Ready to share" : "Ready to publish"}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
            >
              Download
            </a>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void handlePublish();
              }}
              disabled={publishing || published}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishing ? "Publishing..." : published ? "Published" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
