"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetDetailModal } from "@/components/assets/asset-detail-modal";
import { VideoAssetCard } from "@/components/assets/video-asset-card";
import { CreatorShareActions } from "./creator-share-actions";
import { FollowListModal } from "./follow-list-modal";

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
};

type CreatorRow = {
  id: string;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

type Creator = {
  id: string;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isFollowing?: boolean;
  _count?: {
    followers: number;
    following: number;
  };
  assets: PublicAsset[];
};

export function CreatorProfileClient({ username }: { username: string }) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<PublicAsset | null>(null);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followers, setFollowers] = useState<CreatorRow[]>([]);
  const [followingList, setFollowingList] = useState<CreatorRow[]>([]);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    async function loadFollowLists() {
      const res = await fetch(`/api/public-creators/${username}/follows`);
      const data = await res.json();

      if (res.ok) {
        setFollowers(data.followers ?? []);
        setFollowingList(data.following ?? []);
      }
    }

    async function loadCreator() {
      try {
        const res = await fetch(`/api/public-creators/${username}`);
        const data = await res.json();

        if (res.ok) {
          setCreator(data.creator);
          setFollowing(Boolean(data.creator?.isFollowing));
          setFollowersCount(data.creator?._count?.followers ?? 0);
          await loadFollowLists();
        }
      } finally {
        setLoading(false);
      }
    }

    void loadCreator();
  }, [username]);

  function mediaTypeOf(asset: PublicAsset) {
    return asset.mediaType === "video" ? "video" : "image";
  }

  function matchesSearch(asset: PublicAsset) {
    const term = query.trim().toLowerCase();
    if (!term) return true;

    return (
      asset.title?.toLowerCase().includes(term) ||
      asset.prompt?.toLowerCase().includes(term)
    );
  }

  const imageCount = useMemo(
    () => creator?.assets.filter((asset) => mediaTypeOf(asset) === "image").length ?? 0,
    [creator]
  );

  const videoCount = useMemo(
    () => creator?.assets.filter((asset) => mediaTypeOf(asset) === "video").length ?? 0,
    [creator]
  );

  const filteredAssets = useMemo(() => {
    if (!creator) return [];

    return creator.assets.filter((asset) => {
      const typeMatch = filter === "all" || mediaTypeOf(asset) === filter;
      return typeMatch && matchesSearch(asset);
    });
  }, [creator, filter, query]);

  function openAsset(asset: PublicAsset) {
    setSelectedAsset(asset);
    setModalOpen(true);
  }

  async function handleFollow() {
    if (!creator) return;

    setFollowLoading(true);

    try {
      const res = await fetch("/api/creators/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creatorId: creator.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to follow creator");
        return;
      }

      setFollowing(data.following);
      setFollowersCount((prev) => (data.following ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="h-40 rounded-[2rem] border border-white/10 bg-white/5" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-3xl font-bold text-white">Creator not found</h1>
        <p className="mt-2 text-muted-foreground">
          This public creator profile does not exist yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName || creator.username || "Creator"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {(creator.displayName || creator.username || "C").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                Creator Profile
              </div>

              <h1 className="mt-3 text-3xl font-bold text-white">
                {creator.displayName || creator.username}
              </h1>

              {creator.username ? (
                <h2 className="mt-1 text-sm text-muted-foreground">
                  @{creator.username}
                </h2>
              ) : null}

              {creator.bio ? (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  {creator.bio}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label={`All (${creator.assets.length})`}
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
            <button
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                following
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
              } disabled:opacity-60`}
            >
              {followLoading ? "Updating..." : following ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setFollowModal("followers")}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 transition hover:bg-white/5"
          >
            {followersCount} followers
          </button>
          <button
            type="button"
            onClick={() => setFollowModal("following")}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 transition hover:bg-white/5"
          >
            {creator._count?.following ?? 0} following
          </button>
        </div>

        <div className="mt-5">
          <CreatorShareActions
            url={`${window.location.origin}/u/${creator.username}`}
            username={creator.username || username}
            displayName={creator.displayName}
          />

          <div className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-white">
              Like this creator's work?
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Follow them to see their latest public images and videos in your Following feed.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this creator's prompts or titles..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filteredAssets.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No creations found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another search or media filter.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      </section>

      <AssetDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        asset={selectedAsset}
      />

      <FollowListModal
        open={followModal === "followers"}
        title="Followers"
        creators={followers}
        onClose={() => setFollowModal(null)}
      />

      <FollowListModal
        open={followModal === "following"}
        title="Following"
        creators={followingList}
        onClose={() => setFollowModal(null)}
      />
    </>
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
