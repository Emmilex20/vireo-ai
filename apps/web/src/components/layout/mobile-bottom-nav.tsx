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
    <nav className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 px-4 md:hidden">
      <div className="mx-auto flex h-16 max-w-[calc(100vw-32px)] items-center justify-between rounded-[28px] border border-white/10 bg-black/75 px-1.5 py-1.5 shadow-[0_18px_52px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
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
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[22px] px-1.5 py-2 text-[10px] transition",
                isActive
                  ? "bg-white text-black shadow-[0_6px_22px_rgba(255,255,255,0.16)]"
                  : "text-slate-400 hover:text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
