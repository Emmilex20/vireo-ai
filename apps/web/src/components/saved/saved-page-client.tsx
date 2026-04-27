"use client";

import { BookmarkX, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetDetailModal } from "@/components/assets/asset-detail-modal";
import { VideoAssetCard } from "@/components/assets/video-asset-card";
import { inferMediaType } from "@/lib/media/infer-media-type";

type MediaFilter = "all" | "image" | "video";

type SavedAsset = {
  id: string;
  title?: string | null;
  prompt?: string | null;
  fileUrl: string;
  createdAt: string;
  isPublic?: boolean;
  mediaType?: "image" | "video";
  sourceImageUrl?: string | null;
  _count?: {
    likes: number;
    saves: number;
    comments?: number;
  };
};

export function SavedPageClient() {
  const [assets, setAssets] = useState<SavedAsset[]>([]);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<SavedAsset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unsavingId, setUnsavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/saved");
        const data = await res.json();
        setAssets(data.assets ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadSaved();
  }, []);

  function mediaTypeOf(asset: SavedAsset) {
    return inferMediaType(asset);
  }

  function matchesSearch(asset: SavedAsset) {
    const term = query.trim().toLowerCase();
    if (!term) return true;

    return (
      asset.title?.toLowerCase().includes(term) ||
      asset.prompt?.toLowerCase().includes(term)
    );
  }

  const imageCount = useMemo(
    () => assets.filter((asset) => mediaTypeOf(asset) === "image").length,
    [assets]
  );

  const videoCount = useMemo(
    () => assets.filter((asset) => mediaTypeOf(asset) === "video").length,
    [assets]
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const typeMatch = filter === "all" || mediaTypeOf(asset) === filter;
      return typeMatch && matchesSearch(asset);
    });
  }, [assets, filter, query]);

  function openAsset(asset: SavedAsset) {
    setSelectedAsset(asset);
    setModalOpen(true);
  }

  async function handleUnsave(assetId: string) {
    setUnsavingId(assetId);

    try {
      const res = await fetch("/api/assets/engagement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId,
          action: "save",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to unsave asset");
        return;
      }

      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));

      if (selectedAsset?.id === assetId) {
        setModalOpen(false);
        setSelectedAsset(null);
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setUnsavingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-[1.5rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Saved Library
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
              Saved public creations
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Revisit gallery creations you bookmarked for inspiration.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label={`All (${assets.length})`}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterButton
              label={`Images (${imageCount})`}
              active={filter === "image"}
              onClick={() => setFilter("image")}
            />
            <FilterButton
              label={`Videos (${videoCount})`}
              active={filter === "video"}
              onClick={() => setFilter("video")}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved prompts or titles..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filteredAssets.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">
              No saved creations found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Save assets from the public gallery or try another filter/search.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="relative">
                <div onClick={() => openAsset(asset)} className="cursor-pointer">
                  {mediaTypeOf(asset) === "video" ? (
                    <VideoAssetCard
                      id={asset.id}
                      title={asset.title}
                      prompt={asset.prompt}
                      fileUrl={asset.fileUrl}
                      createdAt={asset.createdAt}
                      isPublic={asset.isPublic}
                      sourceImageUrl={asset.sourceImageUrl}
                    />
                  ) : (
                    <AssetCard
                      id={asset.id}
                      title={asset.title}
                      prompt={asset.prompt}
                      fileUrl={asset.fileUrl}
                      createdAt={asset.createdAt}
                      isPublic={asset.isPublic}
                    />
                  )}
                </div>

                <button
                  type="button"
                  disabled={unsavingId === asset.id}
                  onClick={() => void handleUnsave(asset.id)}
                  className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 backdrop-blur transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  <BookmarkX className="size-3.5" />
                  {unsavingId === asset.id ? "Removing..." : "Unsave"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <AssetDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        asset={selectedAsset}
      />
    </main>
  );
}

function FilterButton({
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
