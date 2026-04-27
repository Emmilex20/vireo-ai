"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetDetailModal } from "@/components/assets/asset-detail-modal";
import { VideoAssetCard } from "@/components/assets/video-asset-card";
import { inferMediaType } from "@/lib/media/infer-media-type";

type MediaFilter = "all" | "image" | "video";

type FeedAsset = {
  id: string;
  title?: string | null;
  prompt?: string | null;
  fileUrl: string;
  createdAt: string;
  isPublic?: boolean;
  mediaType?: "image" | "video";
  sourceImageUrl?: string | null;
  likedByMe?: boolean;
  savedByMe?: boolean;
  creator?: {
    displayName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
  _count?: {
    likes: number;
    saves: number;
    comments?: number;
  };
};

export function FollowingFeedClient() {
  const [assets, setAssets] = useState<FeedAsset[]>([]);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<FeedAsset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch("/api/following");
        const data = await res.json();
        setAssets(data.assets ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadFeed();
  }, []);

  function mediaTypeOf(asset: FeedAsset) {
    return inferMediaType(asset);
  }

  function matchesSearch(asset: FeedAsset) {
    const term = query.trim().toLowerCase();
    if (!term) return true;

    return (
      asset.title?.toLowerCase().includes(term) ||
      asset.prompt?.toLowerCase().includes(term) ||
      asset.creator?.displayName?.toLowerCase().includes(term) ||
      asset.creator?.username?.toLowerCase().includes(term)
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

  function openAsset(asset: FeedAsset) {
    setSelectedAsset(asset);
    setModalOpen(true);
  }

  async function handleEngagement(assetId: string, action: "like" | "save") {
    const res = await fetch("/api/assets/engagement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assetId, action }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update asset");
      return;
    }

    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              likedByMe: action === "like" ? data.liked : asset.likedByMe,
              savedByMe: action === "save" ? data.saved : asset.savedByMe,
              _count: data.counts,
            }
          : asset
      )
    );
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
              Following Feed
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
              Creations from creators you follow
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Browse new public images and videos from your followed creators.
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
            placeholder="Search followed creators, prompts, or titles..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filteredAssets.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">
              No following feed results found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {query.trim()
                ? "Try another search term or media filter."
                : "Follow creators from the public gallery to build your personalized feed."}
            </p>
            {!query.trim() ? (
              <a
                href="/explore"
                className="mt-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15"
              >
                Explore creations
              </a>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map((asset) => (
              <div key={asset.id}>
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

                {asset.creator?.username ? (
                  <a
                    href={`/u/${asset.creator.username}`}
                    className="mt-3 flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/20 p-3 transition hover:bg-white/5"
                  >
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {asset.creator.avatarUrl ? (
                        <img
                          src={asset.creator.avatarUrl}
                          alt={asset.creator.displayName || asset.creator.username}
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

                    <div>
                      <p className="text-xs font-medium text-white">
                        {asset.creator.displayName || asset.creator.username}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        @{asset.creator.username}
                      </p>
                    </div>
                  </a>
                ) : null}

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleEngagement(asset.id, "like")}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      asset.likedByMe
                        ? "border-red-500/20 bg-red-500/10 text-red-400"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {asset.likedByMe ? "Liked" : "Like"} {asset._count?.likes ?? 0}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleEngagement(asset.id, "save")}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      asset.savedByMe
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {asset.savedByMe ? "Saved" : "Save"} {asset._count?.saves ?? 0}
                  </button>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                    Comments {asset._count?.comments ?? 0}
                  </span>
                </div>
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
