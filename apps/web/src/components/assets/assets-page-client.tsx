/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AssetCard } from "./asset-card";
import { AssetDetailModal } from "./asset-detail-modal";
import { HistoryCard } from "./history-card";
import { VideoAssetCard } from "./video-asset-card";

type MediaFilter = "all" | "image" | "video";
type SortMode = "newest" | "oldest";
type StatusFilter = "all" | "completed" | "processing" | "failed";

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

  const filteredHistory = useMemo(() => {
    const result = history.filter((item) => {
      const typeMatch = filter === "all" || mediaTypeOf(item) === filter;
      const statusMatch = statusFilter === "all" || item.status === statusFilter;

      return typeMatch && statusMatch && matchesSearch(item);
    });

    return sortByDate(result);
  }, [history, filter, query, sortMode, statusFilter]);

  function handleReuseImage(item: ReuseImageItem) {
    const payload = {
      prompt: item.prompt ?? "",
      negativePrompt: item.negativePrompt ?? "",
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
      <div className="rounded-4xl border border-white/10 bg-white/5 p-6">
        <div className="h-7 w-44 rounded bg-white/10" />
        <div className="mt-3 h-4 w-72 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-3xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-4xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">
              Your media library
            </h1>
            <p className="mt-2 text-muted-foreground">
              Search, review, and reuse generated images and videos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label={`All (${assets.length})`}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterButton
              label={`Images (${imageAssets.length})`}
              active={filter === "image"}
              onClick={() => setFilter("image")}
            />
            <FilterButton
              label={`Videos (${videoAssets.length})`}
              active={filter === "video"}
              onClick={() => setFilter("video")}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, prompt, or negative prompt..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-8">
          {filteredAssets.length === 0 ? (
            <EmptyState filter={filter} query={query} kind="assets" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAssets.map((asset) =>
                mediaTypeOf(asset) === "video" ? (
                  <div
                    key={asset.id}
                    onClick={() => openAsset(asset)}
                    className="cursor-pointer"
                  >
                    <VideoAssetCard
                      id={asset.id}
                      title={asset.title}
                      prompt={asset.prompt}
                      fileUrl={asset.fileUrl}
                      createdAt={asset.createdAt}
                      isPublic={asset.isPublic}
                      sourceImageUrl={asset.sourceImageUrl}
                    />
                  </div>
                ) : (
                  <div
                    key={asset.id}
                    onClick={() => openAsset(asset)}
                    className="cursor-pointer"
                  >
                    <AssetCard
                      id={asset.id}
                      title={asset.title}
                      prompt={asset.prompt}
                      fileUrl={asset.fileUrl}
                      createdAt={asset.createdAt}
                      isPublic={asset.isPublic}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-4xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-heading text-2xl font-bold text-white">
          Generation history
        </h2>
        <p className="mt-2 text-muted-foreground">
          History results follow the same media filter and search term.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-6">
          {filteredHistory.length === 0 ? (
            <EmptyState filter={filter} query={query} kind="history" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredHistory.map((item) => (
                <HistoryCard
                  key={item.id}
                  id={item.id}
                  mediaType={mediaTypeOf(item)}
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
                  onReuseImage={mediaTypeOf(item) === "image" ? handleReuseImage : undefined}
                  onReuseVideo={mediaTypeOf(item) === "video" ? handleReuseVideo : undefined}
                />
              ))}
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
