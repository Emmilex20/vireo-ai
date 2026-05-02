"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AudioLines,
  BookOpen,
  ChevronDown,
  Clapperboard,
  CreditCard,
  FolderOpen,
  Globe2,
  Grid2x2,
  Home,
  ImageIcon,
  Lightbulb,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { StudioMode } from "./studio-mode-config";

type StudioHomeSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeMode?: (mode: StudioMode) => void;
  className?: string;
};

type DesktopNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  full?: boolean;
  mode?: StudioMode;
};

function comingSoonHref(feature: string) {
  return `/coming-soon?feature=${encodeURIComponent(feature)}`;
}

const createLinks: DesktopNavItem[] = [
  { label: "Video", href: "/studio", icon: Clapperboard, full: true, mode: "video" },
  { label: "Image", href: "/studio", icon: ImageIcon, mode: "image" },
  { label: "Character", href: comingSoonHref("Character Studio"), icon: Users },
  { label: "World", href: comingSoonHref("World Builder"), icon: Globe2 },
  { label: "Audio", href: comingSoonHref("Audio Studio"), icon: AudioLines },
];

const sidebarSections = [
  {
    label: "Assets",
    items: [
      { label: "Character & World", href: comingSoonHref("Character & World"), icon: Users },
      { label: "Media", href: "/assets", icon: FolderOpen },
    ],
  },
  {
    label: "Inspire",
    items: [
      { label: "Template", href: "/templates", icon: Grid2x2 },
      { label: "Tutorials", href: comingSoonHref("Tutorials"), icon: BookOpen },
      { label: "Blog", href: comingSoonHref("Blog"), icon: Lightbulb },
    ],
  },
  {
    label: "Plan",
    items: [
      { label: "Pricing", href: "/pricing", icon: CreditCard },
    ],
  },
] as const;

const pinnedToolCards = [
  { id: "suite-motion", title: "Motion Sync", href: comingSoonHref("Motion Sync"), mediaUrl: null },
  { id: "suite-lip", title: "Lip-Sync", href: comingSoonHref("Lip-Sync"), mediaUrl: null },
  { id: "suite-edit-video", title: "Edit Video", href: comingSoonHref("Edit Video"), mediaUrl: null },
  { id: "suite-camera", title: "Camera Angle Control", href: comingSoonHref("Camera Angle Control"), mediaUrl: null },
] as const;

export function StudioHomeSidebar({
  open,
  onOpenChange,
  onChangeMode,
  className,
}: StudioHomeSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHrefActive = (href: string) => {
    const [hrefPath = href, hrefQuery] = href.split("?");

    if (hrefPath === "/") {
      return pathname === "/";
    }

    if (hrefPath === "/coming-soon") {
      const hrefFeature = new URLSearchParams(hrefQuery).get("feature");

      return (
        pathname === "/coming-soon" &&
        (!hrefFeature || hrefFeature === searchParams.get("feature"))
      );
    }

    return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  };

  return (
    <aside
      className={cn(
        "h-screen shrink-0 overflow-hidden border-r border-white/10 bg-[#121416] transition-all duration-300",
        open ? "w-52" : "w-15",
        className
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto px-2.5 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className={cn("flex items-center", open ? "justify-between gap-3" : "justify-center")}>
          {open ? (
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image src="/logo.png" alt="Vireon" width={36} height={36} className="size-full object-cover" />
              </div>
              <span className="truncate text-[14px] font-semibold tracking-tight text-white">
                Vireon
              </span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            className="flex size-8 items-center justify-center rounded-xl border border-white/20 bg-transparent text-slate-300 transition hover:bg-white/5"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Grid2x2 className="size-4" />
          </button>
        </div>

        <div className={cn("mt-3.5 space-y-1.5", open ? "" : "flex-1")}>
          {open ? (
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 rounded-[0.85rem] border px-2.5 py-1.5 transition",
                isHrefActive("/")
                  ? "border-fuchsia-400/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-white shadow-[0_0_0_1px_rgba(236,72,153,0.14),0_0_18px_rgba(217,70,239,0.24)]"
                  : "border-white/8 bg-white/4 text-slate-200 hover:bg-white/8 hover:text-white"
              )}
            >
              <span className="flex size-6.5 items-center justify-center rounded-full bg-white text-black">
                <Home className="size-3.5" />
              </span>
              <span className="text-[12px] font-medium">Home</span>
            </Link>
          ) : (
            <div className="space-y-2.5 pt-1">
              <CompactSidebarLink href="/" icon={Home} label="Home" active={isHrefActive("/")} />
              <CompactSidebarLink href="/studio" icon={Sparkles} label="Create" active={isHrefActive("/studio")} />
              <CompactSidebarLink href="/assets" icon={FolderOpen} label="Assets" active={isHrefActive("/assets")} />
              <CompactSidebarLink href="/pricing" icon={CreditCard} label="Pricing" active={isHrefActive("/pricing")} />
              <CompactSidebarLink href={comingSoonHref("Inspire")} icon={Lightbulb} label="Inspire" active={isHrefActive(comingSoonHref("Inspire"))} />
              <div className="mx-auto h-px w-8 bg-white/10" />
              <CompactSidebarLink href={comingSoonHref("All Tools")} icon={Grid2x2} label="All Tools" active={isHrefActive(comingSoonHref("All Tools"))} />
              {pinnedToolCards.map((card) => (
                <CompactSidebarThumb
                  key={card.id}
                  href={card.href}
                  label={card.title}
                  mediaUrl={card.mediaUrl}
                />
              ))}
            </div>
          )}
        </div>

        {open ? (
          <>
            <div className="mt-3.5 space-y-1.5">
              <p className="px-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Create
              </p>
              <div className="space-y-1.5">
                {createLinks
                  .filter((item) => item.full)
                  .map((item) => (
                    <SidebarActionLink
                      key={item.label}
                      item={item}
                      onChangeMode={onChangeMode}
                      className="flex items-center gap-2 rounded-[0.8rem] border border-white/8 bg-white/4 px-2.5 py-1.5 text-slate-100 transition hover:bg-white/8"
                    />
                  ))}
                <div className="grid grid-cols-2 gap-1.5">
                  {createLinks
                    .filter((item) => !item.full)
                    .map((item) => (
                      <SidebarActionLink
                        key={item.label}
                        item={item}
                        onChangeMode={onChangeMode}
                        className="flex min-w-0 items-center gap-1.5 rounded-[0.8rem] border border-white/8 bg-white/4 px-2 py-1.5 text-slate-100 transition hover:bg-white/8"
                      />
                    ))}
                </div>
              </div>
            </div>

            {sidebarSections.map((section) => (
              <div key={section.label} className="mt-3.5 space-y-1.5">
                <p className="px-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  {section.label}
                </p>
                <div className="space-y-1.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition hover:bg-white/5 hover:text-white",
                          isHrefActive(item.href)
                            ? "bg-white/7 text-white"
                            : "text-slate-300"
                        )}
                      >
                        <Icon className="size-4" />
                        <span className="text-[12px] font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-3.5 space-y-1.5">
              <p className="px-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Pinned Tools
              </p>
              <div className="space-y-1.5">
                <Link
                  href={comingSoonHref("All Tools")}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 transition hover:bg-white/5",
                    isHrefActive(comingSoonHref("All Tools"))
                      ? "bg-white/7 text-white"
                      : "text-slate-300"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Grid2x2 className="size-4 text-slate-300" />
                      <span className="text-[12px] font-medium">All Tools</span>
                  </span>
                  <ChevronDown className="size-4 -rotate-90 text-slate-500" />
                </Link>

                {pinnedToolCards.map((card) => (
                  <Link
                    key={card.id}
                    href={card.href}
                    className={cn(
                      "flex items-center gap-2 rounded-[0.9rem] px-2.5 py-1.5 text-slate-300 transition hover:bg-white/5 hover:text-white",
                      isHrefActive(card.href)
                        ? "border border-fuchsia-400/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] text-white shadow-[0_0_0_1px_rgba(236,72,153,0.12),0_0_24px_rgba(217,70,239,0.35)]"
                        : ""
                    )}
                  >
                    <div className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/6 text-primary">
                      {card.mediaUrl ? (
                        <Image src={card.mediaUrl} alt={card.title} fill sizes="28px" className="object-cover" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                    </div>
                    <span className="text-[12px] font-medium">{card.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}

function SidebarActionLink({
  item,
  onChangeMode,
  className,
}: {
  item: DesktopNavItem;
  onChangeMode?: (mode: StudioMode) => void;
  className: string;
}) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon className="size-3.5 shrink-0 text-slate-300" />
      <span className="truncate text-[12px] font-medium">{item.label}</span>
    </>
  );

  if (item.mode && onChangeMode) {
    return (
      <button type="button" onClick={() => onChangeMode(item.mode!)} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={() => {
        if (item.mode) {
          sessionStorage.setItem("vireon_studio_open_mode", item.mode);
        }
      }}
      className={className}
    >
      {content}
    </Link>
  );
}

function CompactSidebarLink({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mx-auto flex w-full max-w-12 flex-col items-center gap-2 rounded-[1.25rem] border px-2 py-2.5 text-center transition",
        active
          ? "border-fuchsia-400/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-white shadow-[0_0_0_1px_rgba(236,72,153,0.14),0_0_22px_rgba(217,70,239,0.34)]"
          : "border-white/8 bg-white/3 text-slate-300 hover:bg-white/7 hover:text-white"
      )}
    >
      <Icon className="size-4.5" />
      <span className="text-[11px] font-medium leading-4">{label}</span>
    </Link>
  );
}

function CompactSidebarThumb({
  href,
  label,
  mediaUrl,
}: {
  href: string;
  label: string;
  mediaUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-white/3 transition hover:bg-white/7"
      title={label}
    >
      {mediaUrl ? (
        <Image src={mediaUrl} alt={label} width={40} height={40} className="size-full object-cover" />
      ) : (
        <Sparkles className="size-4 text-primary" />
      )}
    </Link>
  );
}
