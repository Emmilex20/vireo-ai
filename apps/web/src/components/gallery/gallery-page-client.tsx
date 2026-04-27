"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AssetCard } from "@/components/assets/asset-card";
import { VideoAssetCard } from "@/components/assets/video-asset-card";
import { inferMediaType } from "@/lib/media/infer-media-type";

type MediaFilter = "all" | "image" | "video";

type PublicAsset = {
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

export function GalleryPageClient() {
  const [assets, setAssets] = useState<PublicAsset[]>([]);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        setAssets(data.assets ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadAssets();
  }, []);

  function mediaTypeOf(
    item: Pick<PublicAsset, "mediaType" | "fileUrl"> & {
      mimeType?: string | null;
      type?: string | null;
    }
  ) {
    return inferMediaType(item);
  }

  function matchesSearch(item: PublicAsset) {
    const term = query.trim().toLowerCase();
    if (!term) return true;

    return (
      item.title?.toLowerCase().includes(term) ||
      item.prompt?.toLowerCase().includes(term)
    );
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
      alert(data.error || "Please sign in to interact with this asset");
      return;
    }

    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              likedByMe:
                action === "like" ? data.liked : asset.likedByMe,
              savedByMe:
                action === "save" ? data.saved : asset.savedByMe,
              _count: data.counts,
            }
          : asset
      )
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

  if (loading) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded bg-white/5" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Vireon AI Explore",
            description:
              "A public gallery of AI-generated images and videos created with Vireon AI.",
            url: "https://your-domain.com/explore"
          })
        }}
      />

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,28,0.98),rgba(10,16,24,0.94))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Public showcase
            </div>
            <h1 className="text-3xl font-bold text-white">Explore Vireon creations</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Discover the images, motion clips, and published experiments creators are sharing with Vireon AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="badge">{assets.length} total</span>
            <span className="badge">{imageCount} images</span>
            <span className="badge">{videoCount} videos</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <FilterButton
            label="All"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterButton
            label="Images"
            active={filter === "image"}
            onClick={() => setFilter("image")}
          />
          <FilterButton
            label="Videos"
            active={filter === "video"}
            onClick={() => setFilter("video")}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search prompts..."
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </div>

        {filteredAssets.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">
            No results found
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map((asset) =>
              mediaTypeOf(asset) === "video" ? (
                <div key={asset.id} className="space-y-3">
                  <VideoAssetCard {...asset} detailHref={`/a/${asset.id}`} />
                  {asset.creator?.username ? (
                    <a
                      href={`/u/${asset.creator.username}`}
                      onClick={(event) => event.stopPropagation()}
                      className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/20 p-3 transition hover:bg-white/5"
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
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleEngagement(asset.id, "like");
                      }}
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
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleEngagement(asset.id, "save");
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        asset.savedByMe
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {asset.savedByMe ? "Saved" : "Save"} {asset._count?.saves ?? 0}
                    </button>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                      {asset._count?.comments ?? 0} comments
                    </span>
                  </div>
                </div>
              ) : (
                <div key={asset.id} className="space-y-3">
                  <AssetCard {...asset} detailHref={`/a/${asset.id}`} />
                  {asset.creator?.username ? (
                    <a
                      href={`/u/${asset.creator.username}`}
                      onClick={(event) => event.stopPropagation()}
                      className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/20 p-3 transition hover:bg-white/5"
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
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleEngagement(asset.id, "like");
                      }}
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
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleEngagement(asset.id, "save");
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        asset.savedByMe
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {asset.savedByMe ? "Saved" : "Save"} {asset._count?.saves ?? 0}
                    </button>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                      {asset._count?.comments ?? 0} comments
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
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
      className={`px-4 py-2 rounded-full text-sm border ${
        active
          ? "bg-primary/10 border-primary text-primary"
          : "border-white/10 text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}
