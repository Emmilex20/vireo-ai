"use client";

import { X } from "lucide-react";

type CreatorRow = {
  id: string;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

type FollowListModalProps = {
  open: boolean;
  title: string;
  creators: CreatorRow[];
  onClose: () => void;
};

export function FollowListModal({
  open,
  title,
  creators,
  onClose
}: FollowListModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0b0f19] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        {creators.length === 0 ? (
          <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">No creators yet.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {creators.map((creator) => (
              <a
                key={creator.id}
                href={creator.username ? `/u/${creator.username}` : "#"}
                className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
              >
                <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  {creator.avatarUrl ? (
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName || creator.username || "Creator"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {(creator.displayName || creator.username || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    {creator.displayName || creator.username || "Creator"}
                  </p>
                  {creator.username ? (
                    <p className="text-xs text-muted-foreground">
                      @{creator.username}
                    </p>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
