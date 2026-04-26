"use client"

import Image from "next/image"
import { useState } from "react"
import { getSafeMediaUrl } from "@/lib/media/urls"

type AssetCardProps = {
  id: string
  title?: string | null
  prompt?: string | null
  fileUrl: string
  detailHref?: string
  createdAt: string
  isPublic?: boolean
  type?: string | null
  mimeType?: string | null
}

export function AssetCard({
  id,
  title,
  prompt,
  fileUrl,
  detailHref,
  createdAt,
  isPublic = false,
  type,
  mimeType,
}: AssetCardProps) {
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(isPublic)
  const safeFileUrl = getSafeMediaUrl(fileUrl)
  const isVideo =
    type === "video" ||
    mimeType?.startsWith("video/") ||
    fileUrl.toLowerCase().endsWith(".mp4")

  async function handlePublish() {
    if (published) return

    setPublishing(true)

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
      })

      const data = await res.json()

      if (!res.ok) {
        window.alert(data.error || "Failed to publish")
        setPublishing(false)
        return
      }

      setPublished(true)
    } catch {
      window.alert("Something went wrong")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
        {detailHref ? (
          <a
            href={detailHref}
            className="absolute inset-0 z-10"
            aria-label={title || prompt || "Open generated asset"}
          />
        ) : null}

        {isVideo ? (
          <video
            src={safeFileUrl ?? fileUrl}
            controls
            className="relative z-0 h-full w-full object-cover"
          />
        ) : !safeFileUrl ? (
          <div className="relative z-0 flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            This asset has an invalid image URL and cannot be previewed here.
          </div>
        ) : (
          <Image
            src={safeFileUrl}
            alt={title || prompt || "Generated asset"}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            loading="lazy"
            className="z-0 object-cover"
          />
        )}

        {published ? (
          <div className="absolute right-3 top-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            Published
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-white">
          {detailHref ? (
            <a href={detailHref} className="transition hover:text-primary">
              {title || (isVideo ? "Generated video" : "Generated image")}
            </a>
          ) : (
            title || (isVideo ? "Generated video" : "Generated image")
          )}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {prompt || "No prompt stored"}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={safeFileUrl ?? fileUrl}
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
                event.stopPropagation()
                void handlePublish()
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
  )
}
