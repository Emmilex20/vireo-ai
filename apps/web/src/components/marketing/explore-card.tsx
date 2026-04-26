import { Eye, Heart, Play } from "lucide-react"

import { formatCount } from "@vireon/utils"

type ExploreCardProps = {
  title: string
  creator: string
  likes: number
  views: string
  height: "medium" | "tall" | "wide"
}

const heightMap = {
  medium: "h-[300px]",
  tall: "h-[380px]",
  wide: "h-[260px]",
}

export function ExploreCard({
  title,
  creator,
  likes,
  views,
  height,
}: ExploreCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 ${heightMap[height]}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01)),radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_25%),linear-gradient(135deg,#111827,#1f2937,#0f172a)] transition duration-500 group-hover:scale-[1.03]" />

      <div className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md">
        <Play className="size-4 fill-white" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
          <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">@{creator}</p>

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
  )
}
