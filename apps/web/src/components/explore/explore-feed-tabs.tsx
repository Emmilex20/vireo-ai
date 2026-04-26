"use client"

import { cn } from "@/lib/utils"

type ExploreTab = "recommended" | "following"

type ExploreFeedTabsProps = {
  activeTab: ExploreTab
  onChange: (tab: ExploreTab) => void
}

export function ExploreFeedTabs({
  activeTab,
  onChange,
}: ExploreFeedTabsProps) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange("recommended")}
        className={cn(
          "rounded-full border px-4 py-2 text-sm transition",
          activeTab === "recommended"
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-white/10 bg-white/5 text-white hover:bg-white/10"
        )}
      >
        Recommended
      </button>

      <button
        type="button"
        onClick={() => onChange("following")}
        className={cn(
          "rounded-full border px-4 py-2 text-sm transition",
          activeTab === "following"
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-white/10 bg-white/5 text-white hover:bg-white/10"
        )}
      >
        Following
      </button>
    </div>
  )
}
