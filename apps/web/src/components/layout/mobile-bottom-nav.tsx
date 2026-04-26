"use client"

import { useState } from "react"
import { Compass, FolderOpen, PlusSquare, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { id: "explore", label: "Explore", icon: Compass },
  { id: "assets", label: "Assets", icon: FolderOpen },
  { id: "create", label: "Create", icon: PlusSquare },
  { id: "profile", label: "Profile", icon: UserRound },
]

export function MobileBottomNav() {
  const [active, setActive] = useState("explore")

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-white/10 bg-black/60 px-3 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={cn(
                "flex min-w-[72px] flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] transition",
                isActive
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
