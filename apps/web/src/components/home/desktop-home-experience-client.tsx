"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines,
  BookOpen,
  ChevronLeft,
  ChevronDown,
  Clapperboard,
  Compass,
  FolderOpen,
  Gift,
  Globe2,
  Grid2x2,
  HelpCircle,
  Home,
  ImageIcon,
  Lightbulb,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { HeaderAuth } from "@/components/layout/header-auth";
import type { HomeExperienceCard } from "./home-experience-data";

type DesktopHomeExperienceClientProps = {
  spotlightCards: HomeExperienceCard[];
  suiteCards: HomeExperienceCard[];
  latestModelCards: HomeExperienceCard[];
  inspirationImageCards: HomeExperienceCard[];
  inspirationVideoCards: HomeExperienceCard[];
};

type DesktopNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  full?: boolean;
};

type DesktopHeroCategory = {
  label: string;
  href: string;
  icon: LucideIcon;
  accent?: string;
};

type VideoDropdownItem = {
  label: string;
  href: string;
  card?: HomeExperienceCard;
};

type ImageDropdownItem = {
  label: string;
  href: string;
  card?: HomeExperienceCard;
};

type CharacterDropdownItem = {
  label: string;
  href: string;
  card?: HomeExperienceCard;
  icon?: LucideIcon;
};

const createLinks: DesktopNavItem[] = [
  { label: "Video", href: "/studio", icon: Clapperboard, full: true },
  { label: "Image", href: "/studio", icon: ImageIcon },
  { label: "Character", href: "/creators", icon: Users },
  { label: "World", href: "/explore", icon: Globe2 },
  { label: "Audio", href: "/studio", icon: AudioLines },
] as const;

const sidebarSections = [
  {
    label: "Assets",
    items: [
      { label: "Character & World", href: "/creators", icon: Users },
      { label: "Media", href: "/assets", icon: FolderOpen },
    ],
  },
  {
    label: "Inspire",
    items: [
      { label: "Template", href: "/templates", icon: Grid2x2 },
      { label: "Tutorials", href: "/pricing", icon: BookOpen },
      { label: "Blog", href: "/explore", icon: Lightbulb },
    ],
  },
] as const;

const heroCategories: DesktopHeroCategory[] = [
  { label: "Story", icon: Sparkles, href: "/video-projects" },
  { label: "Video", icon: Clapperboard, href: "/studio" },
  { label: "Image", icon: ImageIcon, href: "/studio" },
  { label: "Character", icon: Users, href: "/creators" },
  { label: "World", icon: Compass, href: "/explore", accent: "New" },
  { label: "Audio", icon: AudioLines, href: "/studio" },
] as const;

const showcaseMeta = [
  {
    title: "Runway Gen-4.5",
    subtitle: "Cinematic text-to-video generation",
  },
  {
    title: "ChatGPT Image-2",
    subtitle: "Advanced image generation with precise text",
  },
  {
    title: "Seedance 2.0",
    subtitle: "The world's most powerful video model",
  },
] as const;

const videoDropdownLabels = [
  "Frame to Video",
  "Text to Video",
  "Smart Shot",
  "Edit Video",
  "Motion Sync",
  "Lip-Sync",
  "Upscale Video",
  "Replace Character",
  "Extend Video",
  "Add Sound Effect",
  "Restyle Video",
] as const;

const imageDropdownLabels = [
  "Create Image",
  "Image Variations",
  "Edit Image",
  "Image Upscale",
  "Multi View",
  "Camera Angle Control",
  "Face Swap",
  "Vellum Skin Enhancer",
] as const;

const characterDropdownLabels = [
  "Create a Character",
  "Character Image",
  "Character Video",
] as const;

export function DesktopHomeExperienceClient({
  spotlightCards,
  suiteCards,
  latestModelCards,
  inspirationImageCards,
  inspirationVideoCards,
}: DesktopHomeExperienceClientProps) {
  const [inspirationTab, setInspirationTab] = useState<"image" | "video">(
    "video"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVideoDropdownOpen, setIsVideoDropdownOpen] = useState(false);
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  const [isCharacterDropdownOpen, setIsCharacterDropdownOpen] = useState(false);
  const videoDropdownCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const imageDropdownCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const characterDropdownCloseTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const inspirationCards = useMemo(
    () =>
      inspirationTab === "image"
        ? inspirationImageCards
        : inspirationVideoCards,
    [inspirationImageCards, inspirationTab, inspirationVideoCards]
  );
  const pinnedToolCards = useMemo(
    () => [
      suiteCards.find((card) => card.id === "suite-motion") ?? suiteCards[0],
      suiteCards.find((card) => card.id === "suite-lip") ?? suiteCards[1] ?? suiteCards[0],
      suiteCards.find((card) => card.id === "suite-edit-video") ?? suiteCards[2] ?? suiteCards[0],
      suiteCards.find((card) => card.id === "suite-camera") ?? suiteCards[3] ?? suiteCards[0],
    ],
    [suiteCards]
  );
  const showcaseCards = useMemo(
    () =>
      spotlightCards.slice(0, 3).map((card, index) => ({
        ...card,
        title: showcaseMeta[index]?.title ?? card.title,
        subtitle: showcaseMeta[index]?.subtitle ?? card.subtitle,
      })),
    [spotlightCards]
  );
  const videoDropdownItems = useMemo<VideoDropdownItem[]>(() => {
    const sourceCards = [
      ...suiteCards,
      ...inspirationVideoCards,
      ...spotlightCards.filter((card) => card.mediaType === "video"),
    ].filter(Boolean);

    return videoDropdownLabels.map((label, index) => ({
      label,
      href: "/studio",
      card: sourceCards[index % Math.max(sourceCards.length, 1)],
    }));
  }, [inspirationVideoCards, spotlightCards, suiteCards]);
  const imageDropdownItems = useMemo<ImageDropdownItem[]>(() => {
    const sourceCards = [
      ...latestModelCards,
      ...inspirationImageCards,
      ...suiteCards,
      ...spotlightCards.filter((card) => card.mediaType === "image"),
    ].filter(Boolean);

    return imageDropdownLabels.map((label, index) => ({
      label,
      href: "/studio",
      card: sourceCards[index % Math.max(sourceCards.length, 1)],
    }));
  }, [inspirationImageCards, latestModelCards, spotlightCards, suiteCards]);
  const characterDropdownItems = useMemo<CharacterDropdownItem[]>(() => {
    const sourceCards = [
      ...inspirationImageCards,
      ...inspirationVideoCards,
      ...suiteCards,
      ...spotlightCards,
    ].filter(Boolean);

    return characterDropdownLabels.map((label, index) => ({
      label,
      href: index === 0 ? "/creators" : "/studio",
      card: sourceCards[index % Math.max(sourceCards.length, 1)],
      icon: index === 0 ? Sparkles : undefined,
    }));
  }, [inspirationImageCards, inspirationVideoCards, spotlightCards, suiteCards]);

  function clearVideoDropdownCloseTimer() {
    if (videoDropdownCloseTimer.current) {
      clearTimeout(videoDropdownCloseTimer.current);
      videoDropdownCloseTimer.current = null;
    }
  }

  function clearImageDropdownCloseTimer() {
    if (imageDropdownCloseTimer.current) {
      clearTimeout(imageDropdownCloseTimer.current);
      imageDropdownCloseTimer.current = null;
    }
  }

  function clearCharacterDropdownCloseTimer() {
    if (characterDropdownCloseTimer.current) {
      clearTimeout(characterDropdownCloseTimer.current);
      characterDropdownCloseTimer.current = null;
    }
  }

  function openVideoDropdown() {
    clearVideoDropdownCloseTimer();
    setIsVideoDropdownOpen(true);
    setIsImageDropdownOpen(false);
    setIsCharacterDropdownOpen(false);
  }

  function scheduleVideoDropdownClose() {
    clearVideoDropdownCloseTimer();
    videoDropdownCloseTimer.current = setTimeout(() => {
      setIsVideoDropdownOpen(false);
      videoDropdownCloseTimer.current = null;
    }, 1500);
  }

  function openImageDropdown() {
    clearImageDropdownCloseTimer();
    setIsImageDropdownOpen(true);
    setIsVideoDropdownOpen(false);
    setIsCharacterDropdownOpen(false);
  }

  function scheduleImageDropdownClose() {
    clearImageDropdownCloseTimer();
    imageDropdownCloseTimer.current = setTimeout(() => {
      setIsImageDropdownOpen(false);
      imageDropdownCloseTimer.current = null;
    }, 1500);
  }

  function openCharacterDropdown() {
    clearCharacterDropdownCloseTimer();
    setIsCharacterDropdownOpen(true);
    setIsVideoDropdownOpen(false);
    setIsImageDropdownOpen(false);
  }

  function scheduleCharacterDropdownClose() {
    clearCharacterDropdownCloseTimer();
    characterDropdownCloseTimer.current = setTimeout(() => {
      setIsCharacterDropdownOpen(false);
      characterDropdownCloseTimer.current = null;
    }, 1500);
  }

  useEffect(
    () => () => {
      clearVideoDropdownCloseTimer();
      clearImageDropdownCloseTimer();
      clearCharacterDropdownCloseTimer();
    },
    []
  );

  return (
    <div className="hidden lg:block">
      <section className="fixed inset-x-0 top-0 z-50 bg-[linear-gradient(90deg,rgba(9,11,11,0.98),rgba(16,57,31,0.98)_50%,rgba(9,11,11,0.98))]">
        <div className="relative flex h-12 items-center justify-center px-6 text-center">
          <p className="text-[0.75rem] font-medium tracking-[0.01em] text-white/95">
            Limited-time offer! Unlock a year of limitless creativity with annual
            plans at <span className="text-[0.9rem] font-semibold text-white">50% off.</span>
          </p>
          <Link
            href="/pricing"
            className="absolute right-16 inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-4 text-[0.8rem] font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            View Plan
          </Link>
          <button
            type="button"
            className="absolute right-3 flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Dismiss offer"
          >
            <ChevronLeft className="size-3.5 rotate-45" />
          </button>
        </div>
      </section>

      <aside
        className={`fixed bottom-0 left-0 top-12 z-40 overflow-hidden border-r border-white/10 bg-[#121416] transition-all duration-300 ${
          isSidebarOpen ? "w-66" : "w-20.5"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div
            className={`flex items-center ${
              isSidebarOpen ? "justify-between gap-3" : "justify-center"
            }`}
          >
            {isSidebarOpen ? (
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="/logo.png"
                    alt="Vireon"
                    width={36}
                    height={36}
                    className="size-full object-cover"
                  />
                </div>
                <span className="truncate text-[17px] font-semibold tracking-tight text-white">
                  Vireon
                </span>
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((value) => !value)}
              className="flex size-9 items-center justify-center rounded-2xl border border-white/20 bg-transparent text-slate-300 transition hover:bg-white/5"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Grid2x2 className="size-4" />
            </button>
          </div>

          <div className={`mt-5 space-y-2.5 ${isSidebarOpen ? "" : "flex-1"}`}>
            {isSidebarOpen ? (
              <>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-[1.05rem] border border-fuchsia-400/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-4 py-3 text-white shadow-[0_0_0_1px_rgba(236,72,153,0.14),0_0_26px_rgba(217,70,239,0.34)]"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-white text-black">
                    <Home className="size-3.5" />
                  </span>
                  <span className="text-[14px] font-medium">Home</span>
                </Link>
              </>
            ) : (
              <div className="space-y-2.5 pt-1">
                <CompactSidebarLink href="/" icon={Home} label="Home" active />
                <CompactSidebarLink href="/studio" icon={Sparkles} label="Create" />
                <CompactSidebarLink href="/assets" icon={FolderOpen} label="Assets" />
                <CompactSidebarLink href="/explore" icon={Lightbulb} label="Inspire" />
                <div className="mx-auto h-px w-8 bg-white/10" />
                <CompactSidebarLink href="/studio" icon={Grid2x2} label="All Tools" />
                {pinnedToolCards.map((card) => (
                  <CompactSidebarThumb key={card.id} href={card.href} label={card.title} mediaUrl={card.mediaUrl} />
                ))}
              </div>
            )}
          </div>

          {isSidebarOpen ? (
            <>
              <div className="mt-6 space-y-2.5">
                <p className="px-3 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                  Create
                </p>
                <div className="space-y-2">
                  {createLinks
                    .filter((item) => item.full)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 rounded-[0.95rem] border border-white/8 bg-white/4 px-4 py-2.5 text-slate-100 transition hover:bg-white/8"
                        >
                          <Icon className="size-4.5 text-slate-300" />
                          <span className="text-[14px] font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  <div className="grid grid-cols-2 gap-2">
                    {createLinks
                      .filter((item) => !item.full)
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex min-w-0 items-center gap-2.5 rounded-[0.95rem] border border-white/8 bg-white/4 px-4 py-2.5 text-slate-100 transition hover:bg-white/8"
                          >
                            <Icon className="size-4 text-slate-300" />
                            <span className="truncate text-[13px] font-medium tracking-[-0.01em]">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>

              {sidebarSections.map((section) => (
                <div key={section.label} className="mt-6 space-y-2.5">
                  <p className="px-3 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                    {section.label}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 rounded-2xl px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <Icon className="size-4.5" />
                          <span className="text-[14px] font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-6 space-y-2.5">
                <p className="px-3 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                  Pinned Tools
                </p>
                <div className="space-y-2">
                  <Link
                    href="/studio"
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-2 text-white transition hover:bg-white/5"
                  >
                    <span className="flex items-center gap-3">
                      <Grid2x2 className="size-4.5 text-slate-300" />
                      <span className="text-[14px] font-medium">All Tools</span>
                    </span>
                    <ChevronDown className="size-4 -rotate-90 text-slate-500" />
                  </Link>

                  {pinnedToolCards.map((card, index) => (
                    <Link
                      key={card.id}
                      href={card.href}
                      className={`flex items-center gap-3 rounded-[1.05rem] px-3 py-1.5 text-slate-300 transition hover:bg-white/5 hover:text-white ${
                        index === 0
                          ? "border border-fuchsia-400/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] text-white shadow-[0_0_0_1px_rgba(236,72,153,0.12),0_0_24px_rgba(217,70,239,0.35)]"
                          : ""
                      }`}
                    >
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-md bg-white/6">
                        {card.mediaUrl ? (
                          <Image
                            src={card.mediaUrl}
                            alt={card.title}
                            fill
                            sizes="28px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-primary">
                            <Sparkles className="size-4" />
                          </div>
                        )}
                      </div>
                      <span className="text-[14px] font-medium">{card.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </aside>

      {!isSidebarOpen ? (
        <div className="fixed left-23.5 top-[4.1rem] z-40 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white">
              <Image
                src="/logo.png"
                alt="Vireon"
                width={36}
                height={36}
                className="size-full object-cover"
              />
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-white">
              Vireon
            </span>
          </Link>
          <span className="h-5 w-px bg-white/10" />
          <span className="text-[14px] font-medium text-white">Home</span>
        </div>
      ) : null}

      <div
        className={`pt-10 transition-[padding] duration-300 ${
          isSidebarOpen ? "pl-73" : "pl-26"
        }`}
      >
        <div className="w-full px-5 pr-8 xl:px-6 xl:pr-10">
          <div className="min-w-0 space-y-11 pb-14">
            <div className="flex items-center justify-between gap-6 pt-6">
              <div className="text-[0.92rem] font-medium text-white">Home</div>

              <div className="flex items-center gap-5">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-white transition hover:text-primary"
                >
                  <HelpCircle className="size-4.5" />
                  Help
                  <ChevronDown className="size-3.5" />
                </Link>

                <span className="h-6 w-px bg-white/10" />

                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-slate-200 transition hover:text-white"
                >
                  <Gift className="size-4.5" />
                  Pricing
                </Link>

                <HeaderAuth />
              </div>
            </div>

            <section className="space-y-7 pt-2">
              <div className="mx-auto max-w-235 text-center">
                <h1 className="text-[3.45rem] font-semibold leading-[0.93] tracking-tight text-white xl:text-[4.15rem]">
                  What would you like
                  <br />
                  to{" "}
                  <span className="bg-[linear-gradient(90deg,#f5b8ff,#ec4899,#d946ef)] bg-clip-text text-transparent">
                    create
                  </span>{" "}
                  today?
                </h1>
              </div>

              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-[#1a1c1f] p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
                {heroCategories.map((item) => {
                  const Icon = item.icon;
                  if (item.label === "Video") {
                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={openVideoDropdown}
                        onMouseLeave={scheduleVideoDropdownClose}
                        onFocus={openVideoDropdown}
                        onBlur={scheduleVideoDropdownClose}
                      >
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-2 rounded-full bg-white/6 px-5 py-2 text-[0.9rem] font-semibold text-white transition hover:bg-white/10"
                        >
                          <Icon className="size-4 text-slate-100" />
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`size-3.5 text-slate-300 transition ${
                              isVideoDropdownOpen ? "rotate-180 text-white" : ""
                            }`}
                          />
                        </Link>

                        <div
                          className={`absolute left-1/2 top-full z-40 mt-3 w-72 -translate-x-1/2 transition duration-150 ${
                            isVideoDropdownOpen
                              ? "pointer-events-auto translate-y-0 opacity-100"
                              : "pointer-events-none -translate-y-1 opacity-0"
                          }`}
                          onMouseEnter={openVideoDropdown}
                          onMouseLeave={scheduleVideoDropdownClose}
                        >
                          <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#1d2023] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)] [scrollbar-color:#6b7280_transparent] [scrollbar-width:thin]">
                            {videoDropdownItems.map((dropdownItem, index) => (
                              <Link
                                key={dropdownItem.label}
                                href={dropdownItem.href}
                                className="flex items-center gap-3 rounded-full px-2.5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
                              >
                                <VideoDropdownThumb
                                  item={dropdownItem}
                                  priority={index < 4}
                                />
                                <span className="truncate">{dropdownItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item.label === "Image") {
                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={openImageDropdown}
                        onMouseLeave={scheduleImageDropdownClose}
                        onFocus={openImageDropdown}
                        onBlur={scheduleImageDropdownClose}
                      >
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-2 rounded-full bg-white/6 px-5 py-2 text-[0.9rem] font-semibold text-white transition hover:bg-white/10"
                        >
                          <Icon className="size-4 text-slate-100" />
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`size-3.5 text-slate-300 transition ${
                              isImageDropdownOpen ? "rotate-180 text-white" : ""
                            }`}
                          />
                        </Link>

                        <div
                          className={`absolute left-1/2 top-full z-40 mt-3 w-72 -translate-x-1/2 transition duration-150 ${
                            isImageDropdownOpen
                              ? "pointer-events-auto translate-y-0 opacity-100"
                              : "pointer-events-none -translate-y-1 opacity-0"
                          }`}
                          onMouseEnter={openImageDropdown}
                          onMouseLeave={scheduleImageDropdownClose}
                        >
                          <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#1d2023] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)] [scrollbar-color:#6b7280_transparent] [scrollbar-width:thin]">
                            {imageDropdownItems.map((dropdownItem, index) => (
                              <Link
                                key={dropdownItem.label}
                                href={dropdownItem.href}
                                className="flex items-center gap-3 rounded-full px-2.5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
                              >
                                <ImageDropdownThumb
                                  item={dropdownItem}
                                  priority={index < 4}
                                />
                                <span className="truncate">{dropdownItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item.label === "Character") {
                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={openCharacterDropdown}
                        onMouseLeave={scheduleCharacterDropdownClose}
                        onFocus={openCharacterDropdown}
                        onBlur={scheduleCharacterDropdownClose}
                      >
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-2 rounded-full bg-white/6 px-5 py-2 text-[0.9rem] font-semibold text-white transition hover:bg-white/10"
                        >
                          <Icon className="size-4 text-slate-100" />
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`size-3.5 text-slate-300 transition ${
                              isCharacterDropdownOpen
                                ? "rotate-180 text-white"
                                : ""
                            }`}
                          />
                        </Link>

                        <div
                          className={`absolute left-1/2 top-full z-40 mt-3 w-72 -translate-x-1/2 transition duration-150 ${
                            isCharacterDropdownOpen
                              ? "pointer-events-auto translate-y-0 opacity-100"
                              : "pointer-events-none -translate-y-1 opacity-0"
                          }`}
                          onMouseEnter={openCharacterDropdown}
                          onMouseLeave={scheduleCharacterDropdownClose}
                        >
                          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1d2023] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                            {characterDropdownItems.map((dropdownItem, index) => (
                              <Link
                                key={dropdownItem.label}
                                href={dropdownItem.href}
                                className="flex items-center gap-3 rounded-full px-2.5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
                              >
                                <CharacterDropdownThumb
                                  item={dropdownItem}
                                  priority={index < 3}
                                />
                                <span className="truncate">{dropdownItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.88rem] font-medium text-white transition hover:bg-white/5"
                    >
                      <Icon className="size-4 text-slate-200" />
                      <span>{item.label}</span>
                      {item.accent ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          {item.accent}
                        </span>
                      ) : null}
                      <ChevronDown className="size-3.5 text-slate-400 transition group-hover:text-white" />
                    </Link>
                  );
                })}
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                {showcaseCards.map((card) => (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="group relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#14181e] shadow-[0_18px_36px_rgba(0,0,0,0.22)]"
                  >
                    <div className="relative h-58 overflow-hidden">
                      {card.mediaUrl ? (
                        card.mediaType === "video" ? (
                          <video
                            src={card.mediaUrl}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <Image
                            src={card.mediaUrl}
                            alt={card.title}
                            fill
                            sizes="(min-width: 1280px) 30vw, 50vw"
                            className="object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(140deg,#123c2f,#102033_55%,#14161c)]" />
                      )}

                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.1)_35%,rgba(0,0,0,0.7)_100%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="max-w-[92%] text-[1.08rem] font-semibold leading-snug text-white">
                          {card.title}
                        </h3>
                        <p className="mt-1 max-w-[88%] text-[0.88rem] leading-5 text-white/82">
                          {card.subtitle}
                        </p>
                        <div className="mt-2 inline-flex rounded-full bg-white/75 px-3.5 py-1.5 text-[0.78rem] font-medium text-black backdrop-blur-md">
                          Try Now
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.95rem] font-semibold tracking-tight text-white">
                  Vireon Suite
                </h2>
                <Link
                  href="/studio"
                  className="text-[0.95rem] font-medium text-slate-300 transition hover:text-white"
                >
                  More {"->"}
                </Link>
              </div>

              <div className="grid gap-5 xl:grid-cols-4">
                {suiteCards.slice(0, 4).map((card) => (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="group flex items-center justify-between gap-4 rounded-[1.4rem] border border-primary/65 bg-[#0f1213] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.18)] transition hover:border-primary"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[1rem] font-semibold leading-tight text-white">
                        {accentLastWord(card.title)}
                      </h3>
                      <p className="mt-2 max-w-xs text-[0.84rem] leading-5.5 text-slate-400">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="relative size-24 shrink-0 overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/5">
                      {card.mediaUrl ? (
                        card.mediaType === "video" ? (
                          <video
                            src={card.mediaUrl}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={card.mediaUrl}
                            alt={card.title}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        )
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/6 text-primary">
                          <Sparkles className="size-8" />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.95rem] font-semibold tracking-tight text-white">
                  Latest AI Models
                </h2>
                <Link
                  href="/studio"
                  className="text-[0.95rem] font-medium text-slate-300 transition hover:text-white"
                >
                  More {"->"}
                </Link>
              </div>

              <div className="grid gap-5 xl:grid-cols-4">
                {latestModelCards.map((card) => (
                  <Link key={card.id} href={card.href} className="group space-y-3">
                    <div className="relative aspect-[1.65/1] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#15191d] shadow-[0_16px_34px_rgba(0,0,0,0.2)]">
                      {card.mediaUrl ? (
                        card.mediaType === "video" ? (
                          <video
                            src={card.mediaUrl}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <Image
                            src={card.mediaUrl}
                            alt={card.title}
                            fill
                            sizes="(min-width: 1280px) 25vw, 50vw"
                            className="object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(140deg,#123c2f,#102033_55%,#14161c)]" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-[1rem] font-semibold leading-tight text-white">
                        {accentLastWord(card.title)}
                      </h3>
                      <p className="mt-1.5 text-[0.84rem] leading-5.5 text-slate-400">
                        {card.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between gap-6">
                <h2 className="text-[1.95rem] font-semibold tracking-tight text-white">
                  Inspirations
                </h2>

                <div className="inline-flex rounded-full border border-white/10 bg-[#1a1c21] p-1.5">
                  {(["image", "video"] as const).map((tab) => {
                    const active = inspirationTab === tab;
                    const Icon = tab === "image" ? ImageIcon : Clapperboard;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setInspirationTab(tab)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.88rem] transition ${
                          active ? "bg-white text-black" : "text-slate-300"
                        }`}
                      >
                        <Icon className="size-4" />
                        {tab === "image" ? "Image" : "Video"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {inspirationCards.map((card, index) => (
                  <Link
                    key={card.id}
                    href={card.href}
                    className={`overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#17181c] shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition hover:border-white/20 ${
                      index % 7 === 5 || index % 7 === 6 ? "row-span-2" : ""
                    }`}
                  >
                    <div
                      className={`relative overflow-hidden ${
                        index % 7 === 5 || index % 7 === 6 ? "h-64" : "h-32"
                      }`}
                    >
                      {card.mediaUrl ? (
                        card.mediaType === "video" ? (
                          <video
                            src={card.mediaUrl}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={card.mediaUrl}
                            alt={card.title}
                            fill
                            sizes="(min-width: 1280px) 20vw, 50vw"
                            className="object-cover"
                          />
                        )
                      ) : (
                        <div className="h-full w-full bg-[linear-gradient(160deg,#1e293b,#111827)]" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-[0.94rem] font-medium text-white">
                        {card.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
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
      className={`group flex flex-col items-center gap-2 rounded-2xl px-2 py-2 text-[11px] transition ${
        active
          ? "text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
      aria-label={label}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-2xl border ${
          active
            ? "border-fuchsia-400/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_0_0_1px_rgba(236,72,153,0.12),0_0_20px_rgba(217,70,239,0.28)]"
            : "border-white/10 bg-white/5"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="leading-none">{label}</span>
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
      className="group flex flex-col items-center gap-2 rounded-2xl px-2 py-1.5 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-white"
      aria-label={label}
    >
      <div className="relative size-7 overflow-hidden rounded-md border border-white/10 bg-white/5">
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={label}
            fill
            sizes="28px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary">
            <Sparkles className="size-4" />
          </div>
        )}
      </div>
      <span className="leading-none">{label}</span>
    </Link>
  );
}

function VideoDropdownThumb({
  item,
  priority,
}: {
  item: VideoDropdownItem;
  priority?: boolean;
}) {
  const card = item.card;

  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/8">
      {card?.mediaUrl ? (
        card.mediaType === "video" ? (
          <video
            src={card.mediaUrl}
            muted
            autoPlay
            loop
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <Image
            src={card.mediaUrl}
            alt={item.label}
            fill
            sizes="36px"
            priority={priority}
            className="object-cover"
          />
        )
      ) : (
        <Clapperboard className="size-4 text-primary" />
      )}
    </span>
  );
}

function ImageDropdownThumb({
  item,
  priority,
}: {
  item: ImageDropdownItem;
  priority?: boolean;
}) {
  const card = item.card;

  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/8">
      {card?.mediaUrl ? (
        card.mediaType === "video" ? (
          <video
            src={card.mediaUrl}
            muted
            autoPlay
            loop
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <Image
            src={card.mediaUrl}
            alt={item.label}
            fill
            sizes="36px"
            priority={priority}
            className="object-cover"
          />
        )
      ) : (
        <ImageIcon className="size-4 text-primary" />
      )}
    </span>
  );
}

function CharacterDropdownThumb({
  item,
  priority,
}: {
  item: CharacterDropdownItem;
  priority?: boolean;
}) {
  const card = item.card;
  const Icon = item.icon;

  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/8">
      {Icon ? (
        <Icon className="size-4 text-slate-200" />
      ) : card?.mediaUrl ? (
        card.mediaType === "video" ? (
          <video
            src={card.mediaUrl}
            muted
            autoPlay
            loop
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <Image
            src={card.mediaUrl}
            alt={item.label}
            fill
            sizes="36px"
            priority={priority}
            className="object-cover"
          />
        )
      ) : (
        <Users className="size-4 text-primary" />
      )}
    </span>
  );
}

function accentLastWord(text: string) {
  const words = text.split(" ");
  if (words.length === 1) {
    return <span className="text-primary">{text}</span>;
  }

  const lastWord = words.pop();
  return (
    <>
      {words.join(" ")} <span className="text-primary">{lastWord}</span>
    </>
  );
}
