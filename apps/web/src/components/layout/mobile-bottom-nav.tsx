"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  FolderOpen,
  PlusSquare,
  UserRound,
  Video,
} from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/assets", label: "Assets", icon: FolderOpen },
  { href: "/studio", label: "Create", icon: PlusSquare },
  { href: "/video-projects", label: "Projects", icon: Video },
  { href: "/profile", label: "Profile", icon: UserRound },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-[max(0.875rem,env(safe-area-inset-bottom))] z-50 px-3 md:hidden">
      <div className="mx-auto flex max-w-[380px] items-center justify-between rounded-[28px] border border-white/10 bg-black/75 px-2 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/explore"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[60px] flex-1 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2.5 text-[11px] transition",
                isActive
                  ? "bg-white text-black shadow-[0_6px_24px_rgba(255,255,255,0.18)]"
                  : "text-slate-400 hover:text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-[18px]" />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
