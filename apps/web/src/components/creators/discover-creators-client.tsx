"use client";

import { Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SortMode = "newest" | "followers" | "assets";

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
    assets: number;
  };
};

export function DiscoverCreatorsClient() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    async function loadCreators() {
      try {
        const res = await fetch("/api/creators");
        const data = await res.json();
        setCreators(data.creators ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadCreators();
  }, []);

  const filteredCreators = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return creators;

    return creators.filter((creator) => {
      return (
        creator.displayName?.toLowerCase().includes(term) ||
        creator.username?.toLowerCase().includes(term) ||
        creator.bio?.toLowerCase().includes(term)
      );
    });
  }, [creators, query]);

  const sortedCreators = useMemo(() => {
    const list = [...filteredCreators];

    return list.sort((a, b) => {
      if (sortMode === "followers") {
        return (b._count?.followers ?? 0) - (a._count?.followers ?? 0);
      }

      if (sortMode === "assets") {
        return (b._count?.assets ?? 0) - (a._count?.assets ?? 0);
      }

      return 0;
    });
  }, [filteredCreators, sortMode]);

  const featuredCreators = useMemo(() => {
    return [...creators]
      .sort((a, b) => {
        const aScore = (a._count?.followers ?? 0) * 2 + (a._count?.assets ?? 0);
        const bScore = (b._count?.followers ?? 0) * 2 + (b._count?.assets ?? 0);

        return bScore - aScore;
      })
      .slice(0, 3);
  }, [creators]);

  function goToAuth(mode: "sign-in" | "sign-up") {
    const redirectPath = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/${mode}?redirect_url=${encodeURIComponent(
      redirectPath
    )}`;
  }

  async function handleFollow(creatorId: string) {
    setUpdatingId(creatorId);

    try {
      const res = await fetch("/api/creators/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creatorId }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setShowAuthPrompt(true);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to update follow state");
        return;
      }

      setCreators((prev) =>
        prev.map((creator) =>
          creator.id === creatorId
            ? {
                ...creator,
                isFollowing: data.following,
                _count: {
                  followers: data.following
                    ? (creator._count?.followers ?? 0) + 1
                    : Math.max(0, (creator._count?.followers ?? 0) - 1),
                  following: creator._count?.following ?? 0,
                  assets: creator._count?.assets ?? 0,
                },
              }
            : creator
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 rounded-[1.5rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Discover Creators
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
              Find creators to follow
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Follow creators whose images, videos, and visual direction inspire your own work.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted-foreground">
            {creators.length} creators
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search creators by name, username, or bio..."
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
            label="Most followed"
            active={sortMode === "followers"}
            onClick={() => setSortMode("followers")}
          />
          <FilterButton
            label="Most assets"
            active={sortMode === "assets"}
            onClick={() => setSortMode("assets")}
          />
        </div>

        {showAuthPrompt ? (
          <div className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-white">
              Create an account to follow creators
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Sign up to build your following feed, save favorite creators, and
              keep up with new public work.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => goToAuth("sign-up")}
                className="rounded-full border border-primary/25 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => goToAuth("sign-in")}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Sign in
              </button>
            </div>
          </div>
        ) : null}

        {featuredCreators.length > 0 ? (
          <div className="mt-8">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
              Featured creators
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Creators with strong public activity and community interest.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {featuredCreators.map((creator) => (
                <a
                  key={creator.id}
                  href={`/u/${creator.username}`}
                  className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-5 transition hover:bg-primary/15"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      {creator.avatarUrl ? (
                        <img
                          src={creator.avatarUrl}
                          alt={creator.displayName || creator.username || "Creator"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-white">
                          {(creator.displayName || creator.username || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {creator.displayName || creator.username}
                      </p>
                      <p className="text-xs text-primary">@{creator.username}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-primary">
                    <span className="rounded-full border border-primary/20 bg-black/20 px-2.5 py-1">
                      {creator._count?.followers ?? 0} followers
                    </span>
                    <span className="rounded-full border border-primary/20 bg-black/20 px-2.5 py-1">
                      {creator._count?.assets ?? 0} assets
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {filteredCreators.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No creators found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another search term.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedCreators.map((creator) => (
              <article
                key={creator.id}
                className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5"
              >
                <a href={`/u/${creator.username}`} className="block">
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      {creator.avatarUrl ? (
                        <img
                          src={creator.avatarUrl}
                          alt={creator.displayName || creator.username || "Creator"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-white">
                          {(creator.displayName || creator.username || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                        {creator.displayName || creator.username}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        @{creator.username}
                      </p>
                    </div>
                  </div>

                  {creator.bio ? (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {creator.bio}
                    </p>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      No bio yet.
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      {creator._count?.assets ?? 0} public assets
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      {creator._count?.followers ?? 0} followers
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      {creator._count?.following ?? 0} following
                    </span>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={() => void handleFollow(creator.id)}
                  disabled={updatingId === creator.id}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:opacity-60 ${
                    creator.isFollowing
                      ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
                  }`}
                >
                  <UserPlus className="size-4" />
                  {updatingId === creator.id
                    ? "Updating..."
                    : creator.isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
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
