"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AudioLines,
  BookOpen,
  CreditCard,
  FolderOpen,
  Globe2,
  Grid2x2,
  ImageIcon,
  Lightbulb,
  Sparkles,
  Users,
  Video
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { CreditsBadge } from "@/components/billing/credits-badge";
import { NotificationNavBadge } from "@/components/notifications/notification-nav-badge";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { StudioHomeSidebar } from "@/components/studio/studio-home-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

type StudioMobileMode = "image" | "video";

type StudioMobileNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  mode?: StudioMobileMode;
};

function comingSoonHref(feature: string) {
  return `/coming-soon?feature=${encodeURIComponent(feature)}`;
}

const navItems = [
  {
    href: "/studio",
    label: "Create Image/Video",
    title: "Image Studio",
    description: "Build visual ideas with premium prompt controls",
    activeDescription: "Prompt to image workflow",
    icon: ImageIcon
  },
  {
    href: "/assets",
    label: "Assets",
    title: "Assets",
    description: "Manage saved generations and history",
    activeDescription: "Saved generated media",
    icon: FolderOpen
  },
  {
    href: "/templates",
    label: "Templates",
    title: "Templates",
    description: "Start faster with reusable creator prompts and layouts",
    activeDescription: "Prompt templates and presets",
    icon: Grid2x2
  },
  {
    href: "/character",
    label: "Character",
    title: "Character Studio",
    description: "Create reusable identities for images and videos",
    activeDescription: "Reusable character workflow",
    icon: Users
  },
  {
    href: "/pricing",
    label: "Pricing",
    title: "Pricing",
    description: "Compare plans and credit options for your creator workflow",
    activeDescription: "Plans and credits",
    icon: CreditCard
  }
];

const comingSoonActiveItem = {
  href: "/coming-soon",
  label: "Coming soon",
  title: "Coming soon",
  description: "This creator workspace is being designed and will launch later.",
  activeDescription: "Upcoming creator workspace",
  icon: Sparkles
};

const defaultActiveItem = {
  href: "/",
  label: "Vireon AI",
  title: "Vireon AI",
  description: "Create, manage, and refine visual projects from one studio.",
  activeDescription: "Creator workspace",
  icon: Sparkles
};

const studioMobileNavSections: Array<{
  label: string;
  items: StudioMobileNavItem[];
}> = [
  {
    label: "Main",
    items: [
      { href: "/studio", label: "Video", icon: Video, mode: "video" },
      { href: "/studio", label: "Image", icon: ImageIcon, mode: "image" },
      { href: "/character", label: "Character", icon: Users },
      { href: comingSoonHref("World Builder"), label: "World", icon: Globe2 },
      { href: comingSoonHref("Audio Studio"), label: "Audio", icon: AudioLines },
    ],
  },
  {
    label: "Assets",
    items: [
      { href: comingSoonHref("Character & World"), label: "Character & World", icon: Users },
      { href: "/assets", label: "Media", icon: FolderOpen },
    ],
  },
  {
    label: "Inspire",
    items: [
      { href: "/templates", label: "Template", icon: Grid2x2 },
      { href: comingSoonHref("Tutorials"), label: "Tutorials", icon: BookOpen },
      { href: comingSoonHref("Blog"), label: "Blog", icon: Lightbulb },
    ],
  },
  {
    label: "Plan",
    items: [
      { href: "/pricing", label: "Pricing", icon: CreditCard },
    ],
  },
  {
    label: "Pinned",
    items: [
      { href: comingSoonHref("All Tools"), label: "All Tools", icon: Grid2x2 },
      { href: comingSoonHref("Motion Sync"), label: "Motion Sync", icon: Video },
      { href: comingSoonHref("Lip-Sync"), label: "Lip-Sync", icon: AudioLines },
      { href: comingSoonHref("Edit Video"), label: "Edit Video", icon: Video },
    ],
  },
] as const;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isStudioRoute =
    pathname === "/studio" ||
    pathname.startsWith("/studio/") ||
    pathname.startsWith("/suite/animate-video/");
  const activeItem =
    pathname.startsWith("/coming-soon")
      ? comingSoonActiveItem
      : navItems.find(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
        ) ?? defaultActiveItem;

  useEffect(() => {
    void fetch("/api/user/sync").catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />

      {!isStudioRoute ? (
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
          <StudioHomeSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        </div>
      ) : null}

      <div
        className={
          isStudioRoute
            ? ""
            : sidebarOpen
              ? "lg:pl-[13rem]"
              : "lg:pl-[3.75rem]"
        }
      >
        <header
          className={cn(
            "sticky top-0 z-30 border-b border-white/10 bg-black/25 backdrop-blur-xl",
            isStudioRoute ? "bg-[#080a0c]/95 lg:hidden" : ""
          )}
        >
          <div className={cn("px-3 py-2 sm:px-6 sm:py-4 lg:px-8", isStudioRoute ? "sm:pb-3" : "")}>
            <div className="flex h-11 items-center justify-between gap-2 sm:h-auto sm:items-start sm:gap-3 lg:h-16 lg:items-center">
              <div className="min-w-0">
                <Link href="/" className="flex items-center gap-2.5 sm:gap-3 lg:hidden">
                  <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 ring-1 ring-white/10 sm:size-10 sm:rounded-2xl">
                    <Image
                      src="/logo.png"
                      alt="Vireon AI"
                      width={36}
                      height={36}
                      className="size-full object-cover"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-heading text-base font-bold leading-none text-white">
                      <span className="sm:hidden">Vireon</span>
                      <span className="hidden sm:inline">Vireon AI</span>
                    </div>
                  </div>
                </Link>
                <h1 className="mt-3 hidden font-heading text-lg font-semibold text-white sm:block lg:mt-0">
                  {activeItem.title}
                </h1>
                <p className="hidden max-w-[16rem] text-xs text-muted-foreground sm:block sm:max-w-none">
                  {activeItem.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 lg:hidden">
                <div className="scale-[0.84] sm:scale-100" data-tour="credits">
                  <CreditsBadge />
                </div>
                <div className="hidden sm:block">
                  <NotificationNavBadge />
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground shadow-[0_0_18px_rgba(16,185,129,0.12)] transition hover:bg-primary/90 sm:flex sm:size-10 sm:border sm:border-primary/20 sm:bg-primary/10 sm:p-0 sm:text-primary sm:hover:bg-primary/15"
                  aria-label="Open pricing"
                >
                  <span className="sm:hidden">Upgrade</span>
                  <CreditCard className="hidden size-4 sm:block" />
                </Link>
                <div className="rounded-full border border-white/10 bg-white/5 p-0.5 sm:p-1">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8 sm:h-9 sm:w-9"
                      }
                    }}
                  />
                </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <div data-tour="credits">
                  <CreditsBadge />
                </div>
                <NotificationNavBadge />

                <div className="rounded-full border border-white/10 bg-white/5 p-1">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9"
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-center gap-2">
                {studioMobileNavSections[0].items.concat([
                  { href: "/video-projects", label: "Story", icon: Video },
                ]).map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={`mobile-tool-${item.label}`}
                        href={item.href}
                        onClick={() => {
                          if (item.mode) {
                            sessionStorage.setItem(
                              "vireon_studio_open_mode",
                              item.mode
                            );
                            window.dispatchEvent(
                              new CustomEvent("vireon:studio-mode", {
                                detail: item.mode,
                              })
                            );
                          }
                        }}
                        className={`relative inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                          isActive
                            ? "border-primary/25 bg-primary/10 text-primary shadow-[0_0_18px_rgba(16,185,129,0.12)]"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        <span className="max-w-36 truncate">{item.label}</span>
                        {isActive ? (
                          <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-primary" />
                        ) : null}
                      </Link>
                    );
                  })}
              </div>
            </div>

            <div className="mt-4 hidden overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:block lg:hidden [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-center gap-2">
                {studioMobileNavSections.flatMap((section, sectionIndex) => {
                  const items = section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={`${section.label}-${item.label}`}
                        href={item.href}
                        onClick={() => {
                          if (item.mode) {
                            sessionStorage.setItem(
                              "vireon_studio_open_mode",
                              item.mode
                            );
                            window.dispatchEvent(
                              new CustomEvent("vireon:studio-mode", {
                                detail: item.mode,
                              })
                            );
                          }
                        }}
                        className={`relative inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border px-3.5 text-xs font-medium transition ${
                          isActive
                            ? "border-primary/25 bg-primary/10 text-primary shadow-[0_0_22px_rgba(16,185,129,0.12)]"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        <span className="max-w-36 truncate">{item.label}</span>
                        {isActive ? (
                          <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-primary" />
                        ) : null}
                      </Link>
                    );
                  });

                  if (sectionIndex === 0) return items;

                  return [
                    <span
                      key={`${section.label}-divider`}
                      className="mx-1 h-7 w-px shrink-0 bg-white/10"
                    />,
                    ...items,
                  ];
                })}
              </div>
            </div>
          </div>
        </header>

        <div className="pb-[4.5rem] md:pb-0">{children}</div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
