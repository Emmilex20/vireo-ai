"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetDetailModal } from "@/components/assets/asset-detail-modal";
import { VideoAssetCard } from "@/components/assets/video-asset-card";

type MediaFilter = "all" | "image" | "video";

type ModerationAsset = {
  id: string;
  title?: string | null;
  prompt?: string | null;
  fileUrl: string;
  createdAt: string;
  isPublic?: boolean;
  mediaType?: "image" | "video";
  creator?: {
    id: string;
    email?: string | null;
    username?: string | null;
    displayName?: string | null;
  } | null;
  _count?: {
    likes: number;
    saves: number;
    comments: number;
  };
};

export function AdminModerationClient() {
  const [assets, setAssets] = useState<ModerationAsset[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [selectedAsset, setSelectedAsset] = useState<ModerationAsset | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await fetch("/api/admin/moderation/assets");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load moderation queue");
          return;
        }

        setAssets(data.assets ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadAssets();
  }, []);

  function mediaTypeOf(asset: ModerationAsset) {
    return asset.mediaType === "video" ? "video" : "image";
  }

  const filteredAssets = useMemo(() => {
    const term = query.trim().toLowerCase();

    return assets.filter((asset) => {
      const typeMatch = filter === "all" || mediaTypeOf(asset) === filter;

      const searchMatch =
        !term ||
        asset.title?.toLowerCase().includes(term) ||
        asset.prompt?.toLowerCase().includes(term) ||
        asset.creator?.email?.toLowerCase().includes(term) ||
        asset.creator?.username?.toLowerCase().includes(term) ||
        asset.creator?.displayName?.toLowerCase().includes(term);

      return typeMatch && searchMatch;
    });
  }, [assets, query, filter]);

  async function handleUnpublish(assetId: string) {
    const confirmed = window.confirm(
      "Unpublish this asset from the public gallery?"
    );
    if (!confirmed) return;

    const note = window.prompt("Reason/note for unpublishing this asset?");
    if (note === null) return;

    setUpdatingId(assetId);

    try {
      const res = await fetch("/api/admin/moderation/assets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assetId, note }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to unpublish asset");
        return;
      }

      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));

      if (selectedAsset?.id === assetId) {
        setSelectedAsset(null);
        setModalOpen(false);
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1300px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1300px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Admin
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Public asset moderation
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review public creations and remove assets from public discovery when
            needed.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompt, title, creator email, or username..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "image", "video"] as MediaFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                filter === item
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {filteredAssets.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">
              No public assets found
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map((asset) => (
              <article
                key={asset.id}
                className="rounded-[1.75rem] border border-white/10 bg-black/20 p-3"
              >
                <div
                  onClick={() => {
                    setSelectedAsset(asset);
                    setModalOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  {mediaTypeOf(asset) === "video" ? (
                    <VideoAssetCard
                      id={asset.id}
                      title={asset.title}
                      prompt={asset.prompt}
                      fileUrl={asset.fileUrl}
                      createdAt={asset.createdAt}
                      isPublic={asset.isPublic}
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

                <div className="mt-3 rounded-[1rem] border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-medium text-white">
                    {asset.creator?.displayName ||
                      asset.creator?.username ||
                      asset.creator?.email ||
                      "Unknown creator"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {asset.creator?.email || asset.creator?.id || "No email"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{asset._count?.likes ?? 0} likes</span>
                    <span>{asset._count?.saves ?? 0} saves</span>
                    <span>{asset._count?.comments ?? 0} comments</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={updatingId === asset.id}
                  onClick={() => handleUnpublish(asset.id)}
                  className="mt-3 w-full rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  {updatingId === asset.id ? "Unpublishing..." : "Unpublish"}
                </button>
              </article>
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
