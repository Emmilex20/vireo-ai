/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clapperboard,
  Eye,
  FolderOpen,
  ImageIcon,
  LayoutGrid,
  Search,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSafeMediaUrl } from "@/lib/media/urls";
import { AssetDetailModal } from "./asset-detail-modal";
import { HistoryCard } from "./history-card";

type MediaFilter = "all" | "image" | "video";
type SortMode = "newest" | "oldest";
type StatusFilter = "all" | "completed" | "processing" | "failed";
type LibraryTab = "image" | "video";

type Asset = {
  id: string;
  title?: string | null;
  prompt?: string | null;
  fileUrl: string;
  createdAt: string;
  isPublic?: boolean;
  mediaType: "image" | "video";
  sourceImageUrl?: string | null;
  sourceAssetId?: string | null;
};

type HistoryItem = {
  id: string;
  mediaType?: "image" | "video";
  modelId?: string | null;
  prompt?: string | null;
  negativePrompt?: string | null;
  failureReason?: string | null;
  refundedAt?: string | null;
  status: string;
  creditsUsed: number;
  createdAt: string;
  style?: string | null;
  aspectRatio?: string | null;
  qualityMode?: string | null;
  promptBoost?: boolean;
  seed?: number | null;
  steps?: number | null;
  guidance?: number | null;
  duration?: number | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  sourceImageUrl?: string | null;
  sourceAssetId?: string | null;
};

type ReuseImageItem = {
  id: string;
  modelId?: string | null;
  sourceImageUrl?: string | null;
  prompt?: string | null;
  negativePrompt?: string | null;
  style?: string | null;
  aspectRatio?: string | null;
  qualityMode?: string | null;
  promptBoost?: boolean;
  seed?: number | null;
  steps?: number | null;
  guidance?: number | null;
};

type ReuseVideoItem = {
  id: string;
  prompt?: string | null;
  negativePrompt?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  sourceImageUrl?: string | null;
  sourceAssetId?: string | null;
};

export function AssetsPageClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [publishingAssetId, setPublishingAssetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("image");

  useEffect(() => {
    async function loadData() {
      try {
        const [assetsRes, historyRes] = await Promise.all([
          fetch("/api/assets"),
          fetch("/api/history")
        ]);

        const assetsData = await assetsRes.json();
        const historyData = await historyRes.json();

        setAssets(assetsData.assets ?? []);
        setHistory(historyData.history ?? []);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function mediaTypeOf(item: { mediaType?: "image" | "video" }) {
    return item.mediaType === "video" ? "video" : "image";
  }

  function matchesSearch(item: {
    title?: string | null;
    prompt?: string | null;
    negativePrompt?: string | null;
  }) {
    const term = query.trim().toLowerCase();
    if (!term) return true;

    return (
      item.title?.toLowerCase().includes(term) ||
      item.prompt?.toLowerCase().includes(term) ||
      item.negativePrompt?.toLowerCase().includes(term)
    );
  }

  function openAsset(asset: Asset) {
    setSelectedAsset(asset);
    setModalOpen(true);
  }

  function sortByDate<T extends { createdAt: string }>(items: T[]) {
    return [...items].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      return sortMode === "newest" ? bTime - aTime : aTime - bTime;
    });
  }

  const imageAssets = useMemo(
    () => assets.filter((asset) => mediaTypeOf(asset) === "image"),
    [assets]
  );

  const videoAssets = useMemo(
    () => assets.filter((asset) => mediaTypeOf(asset) === "video"),
    [assets]
  );

  const filteredAssets = useMemo(() => {
    const result = assets.filter((asset) => {
      const typeMatch = filter === "all" || mediaTypeOf(asset) === filter;
      return typeMatch && matchesSearch(asset);
    });

    return sortByDate(result);
  }, [assets, filter, query, sortMode]);

  const filteredImageAssets = useMemo(
    () => filteredAssets.filter((asset) => mediaTypeOf(asset) === "image"),
    [filteredAssets]
  );

  const filteredVideoAssets = useMemo(
    () => filteredAssets.filter((asset) => mediaTypeOf(asset) === "video"),
    [filteredAssets]
  );

  const filteredHistory = useMemo(() => {
    const result = history.filter((item) => {
      const typeMatch = filter === "all" || mediaTypeOf(item) === filter;
      const statusMatch = statusFilter === "all" || item.status === statusFilter;

      return typeMatch && statusMatch && matchesSearch(item);
    });

    return sortByDate(result);
  }, [history, filter, query, sortMode, statusFilter]);

  const mobilePreviewAssets = filteredAssets.slice(0, 4);
  const mobileHistory = filteredHistory.slice(0, 3);
  const completedHistoryCount = history.filter((item) => item.status === "completed").length;
  const failedHistoryCount = history.filter((item) => item.status === "failed").length;

  function openLibrary(tab: LibraryTab = "image") {
    setLibraryTab(tab);
    setLibraryOpen(true);
  }

  function handleReuseImage(item: ReuseImageItem) {
    const payload = {
      prompt: item.prompt ?? "",
      negativePrompt: item.negativePrompt ?? "",
      modelId: item.modelId ?? "openai/gpt-image-2",
      referenceImageUrl: item.sourceImageUrl ?? "",
      style: item.style ?? "Cinematic",
      aspectRatio: item.aspectRatio ?? "4:3",
      qualityMode: item.qualityMode ?? "high",
      promptBoost: item.promptBoost ?? true,
      seed: item.seed ?? null,
      steps: item.steps ?? 30,
      guidance: item.guidance ?? 7.5
    };

    sessionStorage.setItem("vireon_studio_reuse_payload", JSON.stringify(payload));
    window.location.href = "/studio";
  }

  function handleReuseVideo(item: ReuseVideoItem) {
    const payload = {
      prompt: item.prompt ?? "",
      negativePrompt: item.negativePrompt ?? "",
      duration: String(item.duration ?? 5),
      aspectRatio: item.aspectRatio ?? "16:9",
      motionIntensity: item.motionIntensity ?? "medium",
      cameraMove: item.cameraMove ?? "Slow Push In",
      styleStrength: item.styleStrength ?? "medium",
      motionGuidance: item.motionGuidance ?? 6,
      shotType: item.shotType ?? "Wide Shot",
      fps: String(item.fps ?? 24),
      imageUrl: item.sourceImageUrl ?? "",
      sourceAssetId: item.sourceAssetId ?? ""
    };

    sessionStorage.setItem("vireon_video_studio_reuse_payload", JSON.stringify(payload));
    sessionStorage.setItem("vireon_studio_open_mode", "video");
    window.location.href = "/studio";
  }

  function handleAnimateImage(asset: {
    id: string;
    fileUrl: string;
    prompt?: string | null;
  }) {
    const payload = {
      prompt: asset.prompt ?? "",
      negativePrompt: "",
      duration: "5",
      aspectRatio: "16:9",
      motionIntensity: "medium",
      cameraMove: "Slow Push In",
      styleStrength: "medium",
      motionGuidance: 6,
      shotType: "Wide Shot",
      fps: "24",
      imageUrl: asset.fileUrl,
      sourceAssetId: asset.id
    };

    sessionStorage.setItem(
      "vireon_video_studio_reuse_payload",
      JSON.stringify(payload)
    );
    sessionStorage.setItem("vireon_studio_open_mode", "video");
    window.location.href = "/studio";
  }

  function handleOpenSourceAsset(asset: {
    id: string;
    title?: string | null;
    prompt?: string | null;
    fileUrl: string;
    createdAt: string;
  }) {
    setSelectedAsset({
      ...asset,
      mediaType: "image"
    });

    setModalOpen(true);
  }

  async function handleDeleteAsset(assetId: string) {
    const confirmed = window.confirm("Delete this asset from your library?");
    if (!confirmed) return;

    setDeletingAssetId(assetId);

    try {
      const res = await fetch(`/api/assets?assetId=${assetId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete asset");
        return;
      }

      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      setModalOpen(false);
      setSelectedAsset(null);
    } catch {
      alert("Something went wrong");
    } finally {
      setDeletingAssetId(null);
    }
  }

  async function handleTogglePublish(assetId: string, nextValue: boolean) {
    setPublishingAssetId(assetId);

    try {
      const res = await fetch("/api/assets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assetId,
          isPublic: nextValue
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update visibility");
        return;
      }

      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetId ? { ...asset, isPublic: nextValue } : asset
        )
      );

      setSelectedAsset((prev) =>
        prev && prev.id === assetId ? { ...prev, isPublic: nextValue } : prev
      );
    } catch {
      alert("Something went wrong");
    } finally {
      setPublishingAssetId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="h-7 w-44 rounded-full bg-white/10" />
        <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-[1.35rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid gap-5">
      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1116] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="relative border-b border-white/10 p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(217,70,239,0.12),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <FolderOpen className="size-3.5" />
                Media library
              </div>
              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-white sm:text-4xl">
                Assets that are ready to use.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                Browse every finished generation, download the originals, publish your best work, or reopen a result for deeper editing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[34rem]">
              <StatTile icon={LayoutGrid} label="Total" value={assets.length} />
              <StatTile icon={ImageIcon} label="Images" value={imageAssets.length} />
              <StatTile icon={Clapperboard} label="Videos" value={videoAssets.length} />
              <StatTile icon={CheckCircle2} label="Done" value={completedHistoryCount} />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-primary/30">
              <Search className="size-4 shrink-0 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, prompt, or negative prompt..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                label={`All ${assets.length}`}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <FilterButton
                label={`Images ${imageAssets.length}`}
                active={filter === "image"}
                onClick={() => setFilter("image")}
              />
              <FilterButton
                label={`Videos ${videoAssets.length}`}
                active={filter === "video"}
                onClick={() => setFilter("video")}
              />
              <FilterButton
                label="Newest"
                active={sortMode === "newest"}
                onClick={() => setSortMode("newest")}
              />
              <FilterButton
                label="Oldest"
                active={sortMode === "oldest"}
                onClick={() => setSortMode("oldest")}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InsightPill
              icon={Sparkles}
              label="Public assets"
              value={assets.filter((asset) => asset.isPublic).length}
            />
            <InsightPill icon={UploadCloud} label="Private assets" value={assets.filter((asset) => !asset.isPublic).length} />
            <InsightPill icon={X} label="Failed jobs" value={failedHistoryCount} />
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Saved media
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Click any card to view details, reuse, publish, or animate.
            </p>
          </div>

          {filteredAssets.length > 4 ? (
            <button
              type="button"
              onClick={() => openLibrary(filter === "video" ? "video" : "image")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 text-sm font-semibold text-primary transition hover:bg-primary/15 md:hidden"
            >
              View all
              <Eye className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-5">
          {filteredAssets.length === 0 ? (
            <EmptyState filter={filter} query={query} kind="assets" />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 md:hidden">
                {mobilePreviewAssets.map((asset) => (
                  <AssetTile
                    key={asset.id}
                    asset={asset}
                    onOpen={openAsset}
                    onTogglePublish={handleTogglePublish}
                    publishing={publishingAssetId === asset.id}
                  />
                ))}
              </div>

              <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredAssets.map((asset) => (
                  <AssetTile
                    key={asset.id}
                    asset={asset}
                    onOpen={openAsset}
                    onTogglePublish={handleTogglePublish}
                    publishing={publishingAssetId === asset.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Generation history
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Track recent runs and reuse successful settings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All status"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <FilterButton
              label="Completed"
              active={statusFilter === "completed"}
              onClick={() => setStatusFilter("completed")}
            />
            <FilterButton
              label="Processing"
              active={statusFilter === "processing"}
              onClick={() => setStatusFilter("processing")}
            />
            <FilterButton
              label="Failed"
              active={statusFilter === "failed"}
              onClick={() => setStatusFilter("failed")}
            />
          </div>
        </div>

        <div className="mt-6">
          {filteredHistory.length === 0 ? (
            <EmptyState filter={filter} query={query} kind="history" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="contents md:hidden">
                {mobileHistory.map((item) => (
                  <HistoryCardTile
                    key={item.id}
                    item={item}
                    mediaType={mediaTypeOf(item)}
                    onReuseImage={handleReuseImage}
                    onReuseVideo={handleReuseVideo}
                  />
                ))}
              </div>
              <div className="contents max-md:hidden">
                {filteredHistory.map((item) => (
                  <HistoryCardTile
                    key={item.id}
                    item={item}
                    mediaType={mediaTypeOf(item)}
                    onReuseImage={handleReuseImage}
                    onReuseVideo={handleReuseVideo}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <AssetDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        asset={selectedAsset}
        deleting={deletingAssetId === selectedAsset?.id}
        onDelete={handleDeleteAsset}
        publishing={publishingAssetId === selectedAsset?.id}
        onTogglePublish={handleTogglePublish}
        onAnimateImage={handleAnimateImage}
        onOpenSourceAsset={handleOpenSourceAsset}
      />

      <LibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        tab={libraryTab}
        onTabChange={setLibraryTab}
        images={filteredImageAssets}
        videos={filteredVideoAssets}
        onOpen={(asset) => {
          setLibraryOpen(false);
          openAsset(asset);
        }}
        onTogglePublish={handleTogglePublish}
        publishingAssetId={publishingAssetId}
      />
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LayoutGrid;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function InsightPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LayoutGrid;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/7 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="truncate text-sm text-slate-300">{label}</span>
      </div>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function AssetTile({
  asset,
  onOpen,
  onTogglePublish,
  publishing,
}: {
  asset: Asset;
  onOpen: (asset: Asset) => void;
  onTogglePublish: (assetId: string, nextValue: boolean) => void;
  publishing: boolean;
}) {
  const safeFileUrl = getSafeMediaUrl(asset.fileUrl);
  const isVideo = asset.mediaType === "video";
  const title = asset.title || (isVideo ? "Generated video" : "Generated image");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(asset)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(asset);
        }
      }}
      className="group overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#11161c] shadow-[0_18px_60px_rgba(0,0,0,0.24)] outline-none transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-[#141a21] focus-visible:border-primary/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/30">
        {isVideo ? (
          <video
            src={safeFileUrl ?? asset.fileUrl}
            muted
            loop
            playsInline
            preload="metadata"
            onMouseEnter={(event) => event.currentTarget.play().catch(() => undefined)}
            onMouseLeave={(event) => {
              event.currentTarget.pause();
              event.currentTarget.currentTime = 0;
            }}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : safeFileUrl ? (
          <Image
            src={safeFileUrl}
            alt={title}
            fill
            sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-sm text-slate-500">
            Preview unavailable
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03),rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.72))]" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {isVideo ? <Clapperboard className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          {isVideo ? "Video" : "Image"}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur ${
            asset.isPublic
              ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-300"
              : "border-white/10 bg-black/50 text-slate-200"
          }`}
        >
          {asset.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold leading-6 text-white">
              {title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
              {asset.prompt || "No prompt stored"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
            {new Date(asset.createdAt).toLocaleDateString()}
          </span>

          <div className="flex min-w-0 items-center gap-2">
            <a
              href={safeFileUrl ?? asset.fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/7 text-white transition hover:bg-white/12"
              aria-label="Download asset"
            >
              <ArrowDownToLine className="size-4" />
            </a>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTogglePublish(asset.id, !asset.isPublic);
              }}
              disabled={publishing}
              className="inline-flex h-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-semibold text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishing ? "Saving" : asset.isPublic ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function HistoryCardTile({
  item,
  mediaType,
  onReuseImage,
  onReuseVideo,
}: {
  item: HistoryItem;
  mediaType: "image" | "video";
  onReuseImage: (item: ReuseImageItem) => void;
  onReuseVideo: (item: ReuseVideoItem) => void;
}) {
  return (
    <HistoryCard
      id={item.id}
      mediaType={mediaType}
      modelId={item.modelId}
      prompt={item.prompt}
      negativePrompt={item.negativePrompt}
      failureReason={item.failureReason}
      refundedAt={item.refundedAt}
      status={item.status}
      creditsUsed={item.creditsUsed}
      createdAt={item.createdAt}
      style={item.style}
      aspectRatio={item.aspectRatio}
      qualityMode={item.qualityMode}
      promptBoost={item.promptBoost}
      seed={item.seed}
      steps={item.steps}
      guidance={item.guidance}
      duration={item.duration}
      motionIntensity={item.motionIntensity}
      cameraMove={item.cameraMove}
      styleStrength={item.styleStrength}
      motionGuidance={item.motionGuidance}
      shotType={item.shotType}
      fps={item.fps}
      sourceImageUrl={item.sourceImageUrl}
      sourceAssetId={item.sourceAssetId}
      onReuseImage={mediaType === "image" ? onReuseImage : undefined}
      onReuseVideo={mediaType === "video" ? onReuseVideo : undefined}
    />
  );
}

function LibraryModal({
  open,
  onClose,
  tab,
  onTabChange,
  images,
  videos,
  onOpen,
  onTogglePublish,
  publishingAssetId,
}: {
  open: boolean;
  onClose: () => void;
  tab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  images: Asset[];
  videos: Asset[];
  onOpen: (asset: Asset) => void;
  onTogglePublish: (assetId: string, nextValue: boolean) => void;
  publishingAssetId: string | null;
}) {
  if (!open) return null;

  const items = tab === "image" ? images : videos;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 backdrop-blur-xl sm:items-center sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="All saved assets"
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 bg-[#0b0f14] shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:mx-auto sm:max-w-5xl sm:rounded-[1.75rem]"
      >
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Complete library
              </p>
              <h2 className="mt-1 text-xl font-black text-white">All saved media</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close library"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/25 p-1">
            <TabButton
              label={`Images ${images.length}`}
              active={tab === "image"}
              onClick={() => onTabChange("image")}
            />
            <TabButton
              label={`Videos ${videos.length}`}
              active={tab === "video"}
              onClick={() => onTabChange("video")}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-base font-semibold text-white">
                No {tab === "image" ? "images" : "videos"} here yet
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Finished generations will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((asset) => (
                <AssetTile
                  key={asset.id}
                  asset={asset}
                  onOpen={onOpen}
                  onTogglePublish={onTogglePublish}
                  publishing={publishingAssetId === asset.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-white text-black"
          : "text-slate-400 hover:bg-white/7 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({
  filter,
  query,
  kind
}: {
  filter: MediaFilter;
  query: string;
  kind: "assets" | "history";
}) {
  const mediaLabel =
    filter === "all" ? "media" : filter === "image" ? "image" : "video";

  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
      <p className="text-lg font-medium text-white">
        No {mediaLabel} {kind} found
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {query.trim()
          ? "Try another search term or switch media filters."
          : kind === "assets"
          ? "Completed generations will appear here."
          : "Generation activity will appear here."}
      </p>
    </div>
  );
}
