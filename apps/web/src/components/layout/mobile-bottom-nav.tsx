"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  AudioLines,
  Clapperboard,
  Compass,
  Grid2x2,
  Home,
  ImageIcon,
  Plus,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/templates", label: "Inspire", icon: Sparkles },
  { href: "/studio", label: "Create", icon: Plus },
  { href: "/video-projects", label: "Tools", icon: Grid2x2 },
  { href: "/profile", label: "Profile", icon: UserRound },
]

const createItems = [
  { href: "/studio", label: "Image", icon: ImageIcon, mode: "image" },
  { href: "/studio", label: "Video", icon: Clapperboard, mode: "video" },
  { href: "/coming-soon?feature=Audio%20Studio", label: "Audio", icon: AudioLines },
  { href: "/character", label: "Character", icon: UserRound },
  { href: "/explore", label: "World", icon: Compass },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [createOpen, setCreateOpen] = useState(false)

  function handleStudioMode(mode?: string) {
    if (!mode) return
    sessionStorage.setItem("vireon_studio_open_mode", mode)
    window.dispatchEvent(
      new CustomEvent("vireon:studio-mode", {
        detail: mode,
      })
    )
  }

  return (
    <>
    {createOpen ? (
      <div
        className="fixed inset-0 z-80 overflow-hidden bg-black/76 backdrop-blur-[7px] md:hidden"
        onClick={() => setCreateOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Create menu"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_88%,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.72))]" />
        <div
          className="absolute bottom-0 left-1/2 h-59 w-116 -translate-x-1/2 overflow-hidden rounded-t-full border border-white/10 border-b-0 bg-[#101315]/98 px-4 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-7 shadow-[0_-28px_90px_rgba(0,0,0,0.66)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />
          <div className="relative left-1/2 h-48 w-screen max-w-107.5 -translate-x-1/2 -translate-y-3">
            {createItems.map((item, index) => {
              const Icon = item.icon
              const positions = [
                "left-[25%] top-[28%] -translate-x-1/2",
                "left-1/2 top-[13%] -translate-x-1/2",
                "left-[75%] top-[28%] -translate-x-1/2",
                "left-[9%] top-[63%] -translate-x-1/2",
                "left-[91%] top-[63%] -translate-x-1/2",
              ]

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    handleStudioMode(item.mode)
                    setCreateOpen(false)
                  }}
                  className={cn(
                    "group absolute flex w-19 flex-col items-center gap-1.5 text-center text-[11px] font-semibold text-slate-200 transition hover:text-white",
                    positions[index]
                  )}
                >
                  <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-[0_12px_32px_rgba(0,0,0,0.34)] backdrop-blur transition group-hover:bg-white/14">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="leading-none">{item.label}</span>
                </Link>
              )
            })}
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="absolute left-1/2 top-[66%] flex size-13 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#2a2e34] text-slate-300 shadow-[0_14px_36px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#333842] hover:text-white"
              aria-label="Close create menu"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>
      </div>
    ) : null}

    <nav className="fixed inset-x-0 bottom-0 z-50 px-0 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex h-16 max-w-107.5 items-center justify-between border border-white/10 bg-[#111316]/92 px-2 shadow-[0_-12px_42px_rgba(0,0,0,0.48)] backdrop-blur-2xl min-[431px]:rounded-t-[1.4rem]">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/explore"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isCreate = item.label === "Create"

          if (isCreate) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => setCreateOpen(true)}
                className="relative -mt-6 flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-slate-300 outline-none focus-visible:text-white"
                aria-label="Open create menu"
              >
                <span className="flex size-14 items-center justify-center rounded-full border border-white/12 bg-[#20242a] text-primary shadow-[0_0_0_4px_rgba(255,255,255,0.04),0_12px_28px_rgba(0,0,0,0.5)]">
                  <Sparkles className="size-6" />
                </span>
                <span className="leading-none">Create</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] transition",
                isActive
                  ? "text-white"
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
    </>
  )
}
