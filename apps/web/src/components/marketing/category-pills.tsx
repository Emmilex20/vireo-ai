"use client"

import { useState } from "react"

import { categoryPills } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function CategoryPills() {
  const [active, setActive] = useState("For You")

  return (
    <section className="mt-4">
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryPills.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActive(item)}
            className={cn(
              "rounded-full border px-4 py-2.5 text-sm transition whitespace-nowrap",
              active === item
                ? "border-white/15 bg-white text-black"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  )
}
