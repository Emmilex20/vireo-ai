"use client"

import { useState } from "react"

import { topTabs } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function TopTabs() {
  const [activeTab, setActiveTab] = useState<(typeof topTabs)[number]>(
    "Recommended"
  )

  return (
    <section className="mt-10">
      <div className="flex w-full items-center gap-3 overflow-x-auto pb-2">
        {topTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition whitespace-nowrap",
              activeTab === tab
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  )
}
