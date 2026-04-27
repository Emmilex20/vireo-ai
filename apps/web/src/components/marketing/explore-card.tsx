import Link from "next/link";
import { Eye, Heart, Play } from "lucide-react";

import { formatCount } from "@vireon/utils";
import { getSafeMediaUrl } from "@/lib/media/urls";

type ExploreCardProps = {
  title: string;
  creator: string;
  creatorUsername?: string;
  likes: number;
  views: string;
  height: "medium" | "tall" | "wide";
  mediaUrl?: string | null;
  mediaType?: "image" | "video";
  href?: string;
};

const heightMap = {
  medium: "h-[320px]",
  tall: "h-[380px]",
  wide: "h-[280px]"
};

export function ExploreCard({
  title,
  creator,
  creatorUsername,
  likes,
  views,
  height,
  mediaUrl,
  mediaType = "image",
  href = "/explore"
}: ExploreCardProps) {
  const safeMediaUrl = getSafeMediaUrl(mediaUrl);

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c1116] shadow-[0_24px_70px_rgba(0,0,0,0.34)] ${heightMap[height]}`}
    >
      {href ? (
        <Link
          href={href}
          className="absolute inset-0 z-20"
          aria-label={`Open ${title}`}
        />
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%),linear-gradient(160deg,#101826,#182335_55%,#0f1724)]" />

      {safeMediaUrl ? (
        mediaType === "video" ? (
          <>
            <video
              src={safeMediaUrl}
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_24%),linear-gradient(180deg,rgba(9,14,22,0.05),rgba(9,14,22,0.1)_35%,rgba(9,14,22,0.55)_72%,rgba(9,14,22,0.82)_100%)]" />
          </>
        ) : (
          <img
            src={safeMediaUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
          />
        )
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.18)_40%,rgba(0,0,0,0.84)_100%)]" />

      <div className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
        {mediaType === "video" ? (
          <Play className="size-4 fill-white" />
        ) : (
          <div className="size-2 rounded-full bg-white" />
        )}
      </div>

      {mediaType === "video" ? (
        <div className="absolute left-4 top-4 z-10 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary backdrop-blur-md">
          Motion preview
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <div className="rounded-[1.4rem] border border-white/10 bg-black/45 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
            Featured work
          </div>
          <h3 className="mt-3 line-clamp-2 font-heading text-xl font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-300">
            @{creatorUsername || creator}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Heart className="size-3.5" />
              <span>{formatCount(likes)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              <span>{views}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
