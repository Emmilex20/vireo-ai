"use client";

import Image from "next/image";
import { AudioLines, Copy, Download, ExternalLink, Share2, Trash2, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { getSafeMediaUrl } from "@/lib/media/urls";
import { AssetCommentsPanel } from "./asset-comments-panel";
import { RelatedGenerationsPanel } from "./related-generations-panel";
import { SourceAssetPanel } from "./source-asset-panel";

type AssetDetailModalProps = {
  open: boolean;
  onClose: () => void;
  onDelete?: (assetId: string) => void;
  deleting?: boolean;
  onTogglePublish?: (assetId: string, nextValue: boolean) => void;
  onAnimateImage?: (asset: {
    id: string;
    fileUrl: string;
    prompt?: string | null;
  }) => void;
  onOpenSourceAsset?: (asset: {
    id: string;
    title?: string | null;
    prompt?: string | null;
    fileUrl: string;
    createdAt: string;
  }) => void;
  publishing?: boolean;
  asset: {
    id: string;
    fileUrl: string;
    prompt?: string | null;
    title?: string | null;
    createdAt: string;
    mediaType?: "image" | "video" | "audio";
    isPublic?: boolean;
    sourceAssetId?: string | null;
    creator?: {
      displayName?: string | null;
      username?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
};

export function AssetDetailModal({
  open,
  onClose,
  onDelete,
  deleting = false,
  onTogglePublish,
  onAnimateImage,
  onOpenSourceAsset,
  publishing = false,
  asset
}: AssetDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!open || !asset) return null;

  const activeAsset = asset;
  const safeFileUrl = getSafeMediaUrl(activeAsset.fileUrl);

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(activeAsset.prompt || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleShare() {
    const shareData = {
      title: activeAsset.title || "Generated asset",
      text: activeAsset.prompt || "Generated with Vireon AI",
      url: activeAsset.fileUrl
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(activeAsset.fileUrl);
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center">
        <div className="relative flex w-full max-w-7xl flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#0b0f19] shadow-2xl xl:max-h-[calc(100vh-2rem)] xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,440px)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 transition hover:bg-white/20"
        >
          <X className="size-4 text-white" />
        </button>

        <div className="relative flex min-h-70 items-center justify-center bg-black xl:min-h-0">
          {activeAsset.mediaType === "audio" ? (
            <div className="flex h-full min-h-96 w-full flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_34%_20%,rgba(236,72,153,0.28),transparent_32%),radial-gradient(circle_at_72%_50%,rgba(16,185,129,0.18),transparent_34%),linear-gradient(145deg,#111827,#05070a)] p-6">
              <div className="flex size-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-primary shadow-[0_0_50px_rgba(16,185,129,0.18)]">
                <AudioLines className="size-8" />
              </div>
              <AssetAudioWaveform />
              <audio
                src={safeFileUrl ?? activeAsset.fileUrl}
                controls
                autoPlay
                className="w-full max-w-2xl"
              />
            </div>
          ) : activeAsset.mediaType === "video" ? (
            <video
              src={safeFileUrl ?? activeAsset.fileUrl}
              controls
              autoPlay
              className="max-h-[70vh] w-full object-contain xl:max-h-[calc(100vh-2rem)]"
            />
          ) : !safeFileUrl ? (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              This asset has an invalid media URL and cannot be previewed here.
            </div>
          ) : (
            <Image
              src={safeFileUrl}
              alt="Generated asset"
              width={1600}
              height={900}
              sizes="100vw"
              className="max-h-[70vh] w-full object-contain xl:max-h-[calc(100vh-2rem)]"
            />
          )}
        </div>

        <div className="border-t border-white/10 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:border-l xl:border-t-0">
          <div className="space-y-6 p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                {asset.title || "Generated asset"}
              </h2>
              {asset.creator?.username ? (
                <a
                  href={`/u/${asset.creator.username}`}
                  className="mt-3 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
                >
                  <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-black/30">
                    {asset.creator.avatarUrl ? (
                      <Image
                        src={asset.creator.avatarUrl}
                        alt={asset.creator.displayName || asset.creator.username}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-white">
                        {(asset.creator.displayName || asset.creator.username)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-white">
                    {asset.creator.displayName || asset.creator.username}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    @{asset.creator.username}
                  </span>
                </a>
              ) : null}
              <p className="text-sm leading-7 text-muted-foreground">
                {asset.prompt || "No prompt stored"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Actions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                <Copy className="size-3.5" />
                {copied ? "Copied" : "Copy prompt"}
              </button>

              <a
                href={safeFileUrl ?? asset.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                <ExternalLink className="size-3.5" />
                Open
              </a>

              <a
                href={safeFileUrl ?? asset.fileUrl}
                download
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                <Download className="size-3.5" />
                Download
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"
              >
                <Share2 className="size-3.5" />
                {shared ? "Link copied" : "Share"}
              </button>

              {activeAsset.mediaType === "image" && onAnimateImage ? (
                <button
                  type="button"
                  onClick={() =>
                    onAnimateImage({
                      id: activeAsset.id,
                      fileUrl: activeAsset.fileUrl,
                      prompt: activeAsset.prompt
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"
                >
                  Animate this image
                </button>
              ) : null}

              {onTogglePublish ? (
                <button
                  type="button"
                  onClick={() => onTogglePublish(asset.id, !asset.isPublic)}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15 disabled:opacity-60"
                >
                  <UploadCloud className="size-3.5" />
                  {publishing
                    ? "Updating..."
                    : asset.isPublic
                    ? "Unpublish"
                    : "Publish"}
                </button>
              ) : null}

              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(asset.id)}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  <Trash2 className="size-3.5" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              ) : null}
            </div>
          </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Details
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {new Date(asset.createdAt).toLocaleString()}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {activeAsset.mediaType === "video"
                    ? "Video"
                    : activeAsset.mediaType === "audio"
                      ? "Audio"
                      : "Image"}
                </span>

                {asset.mediaType === "video" && asset.sourceAssetId ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Source asset linked
                  </span>
                ) : null}

                {asset.isPublic ? (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-400">
                    Public
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Private
                  </span>
                )}
              </div>
            </div>

            {asset.mediaType === "image" ? (
              <RelatedGenerationsPanel assetId={asset.id} />
            ) : null}

            {asset.mediaType === "video" && asset.sourceAssetId ? (
              <SourceAssetPanel
                sourceAssetId={asset.sourceAssetId}
                onOpenSource={onOpenSourceAsset}
              />
            ) : null}

            {asset.isPublic ? <AssetCommentsPanel assetId={asset.id} /> : null}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function AssetAudioWaveform() {
  const bars = [34, 58, 88, 132, 170, 136, 94, 68, 44];

  return (
    <div className="flex h-44 items-center justify-center gap-3 opacity-85">
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-5 rounded-full bg-gradient-to-b from-fuchsia-300 via-primary/70 to-slate-500/50 shadow-[0_0_38px_rgba(16,185,129,0.22)]"
          style={{ height }}
        />
      ))}
    </div>
  );
}
