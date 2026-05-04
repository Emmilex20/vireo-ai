"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  AudioLines,
  Clapperboard,
  Compass,
  Film,
  ImageIcon,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type MobileHomeCard = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  mediaUrl?: string | null;
  mediaType: "image" | "video";
  creator?: string;
};

type MobileHomeExperienceClientProps = {
  spotlightCards: MobileHomeCard[];
  suiteCards: MobileHomeCard[];
  inspirationImageCards: MobileHomeCard[];
  inspirationVideoCards: MobileHomeCard[];
};

const quickActions = [
  { label: "Video", icon: Clapperboard, href: "/studio" },
  { label: "Image", icon: ImageIcon, href: "/studio" },
  { label: "Character", icon: Users, href: "/character" },
  { label: "World", icon: Compass, href: "/explore" },
  { label: "Audio", icon: AudioLines, href: "/coming-soon?feature=Audio%20Studio" },
  { label: "Story", icon: Film, href: "/video-projects" },
] as const;

const latestModels = [
  {
    title: "Imagen 4 Ultra",
    subtitle: "Premium photoreal image generation with rich prompt fidelity.",
    badge: "Image",
  },
  {
    title: "Kling v3 Omni",
    subtitle: "Narrative-first cinematic video with strong motion polish.",
    badge: "Video",
  },
  {
    title: "Seedream 4.5",
    subtitle: "Reference-aware image generation with warm cinematic realism.",
    badge: "Image",
  },
] as const;

export function MobileHomeExperienceClient({
  spotlightCards,
  suiteCards,
  inspirationImageCards,
  inspirationVideoCards,
}: MobileHomeExperienceClientProps) {
  const [showOffer, setShowOffer] = useState(true);
  const [inspirationTab, setInspirationTab] = useState<"image" | "video">(
    "image"
  );

  const activeInspirationCards = useMemo(
    () =>
      inspirationTab === "image"
        ? inspirationImageCards
        : inspirationVideoCards,
    [inspirationImageCards, inspirationTab, inspirationVideoCards]
  );

  const featuredModelCard =
    inspirationTab === "image"
      ? inspirationImageCards[0] ?? spotlightCards[0]
      : inspirationVideoCards[0] ?? spotlightCards[0];
  const modelCarouselCards = latestModels.map((model, index) => {
    const source =
      spotlightCards[index] ??
      (model.badge === "Video"
        ? inspirationVideoCards[index]
        : inspirationImageCards[index]) ??
      spotlightCards[0];

    return {
      id: source?.id ?? `model-${model.title}`,
      title: model.title,
      subtitle: model.subtitle,
      badge: model.badge,
      href: "/studio",
      mediaUrl: source?.mediaUrl,
      mediaType: source?.mediaType ?? (model.badge === "Video" ? "video" : "image"),
    };
  });
  const quickStartCards = [
    {
      label: "Create Image",
      href: "/studio",
      icon: ImageIcon,
      media: spotlightCards[0] ?? inspirationImageCards[0],
    },
    {
      label: "Create Video",
      href: "/studio",
      icon: Clapperboard,
      media: inspirationVideoCards[0] ?? spotlightCards[1],
    },
    {
      label: "Character Studio",
      href: "/character",
      icon: Users,
      media: inspirationImageCards[1] ?? spotlightCards[2],
    },
    {
      label: "Talking Video",
      href: "/character",
      icon: AudioLines,
      media: inspirationVideoCards[1] ?? spotlightCards[3],
    },
    {
      label: "Motion Sync",
      href: "/coming-soon?feature=Motion%20Sync",
      icon: Film,
      media: inspirationVideoCards[2] ?? spotlightCards[4],
    },
    {
      label: "Smart Shot",
      href: "/studio",
      icon: Sparkles,
      media: suiteCards[0] ?? spotlightCards[5],
    },
  ];

  return (
    <div className="space-y-5 overflow-x-hidden pb-1 sm:hidden">
      {showOffer ? (
        <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101214] shadow-[0_16px_42px_rgba(0,0,0,0.34)]">
          <div className="relative p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_45%)]" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="max-w-[17rem] text-sm leading-6 text-white">
                  Limited-time offer! Unlock a year of faster creation at 50%
                  off.
                </p>
                <Link
                  href="/pricing"
                  className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-[0_10px_24px_rgba(16,185,129,0.22)]"
                >
                  View plans
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowOffer(false)}
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                aria-label="Dismiss offer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-white">
            Create with Vireon
          </h1>
          <p className="max-w-sm text-sm leading-5 text-slate-400">
            Image, video, characters, audio and cinematic tools in one studio.
          </p>
        </div>

        <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2">
            {quickActions.map((action, index) => (
              <Link
                key={action.label}
                href={action.href}
                className={`inline-flex h-10 items-center rounded-2xl border px-4 text-sm font-medium transition ${
                  index === 0
                    ? "border-primary/45 bg-primary/12 text-primary shadow-[0_0_22px_rgba(16,185,129,0.16)]"
                    : "border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickStartCards.map((card) => {
            const Icon = card.icon;
            const media = card.media;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#17181c] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
              >
                <div className="relative aspect-[0.82] overflow-hidden rounded-[1rem] bg-white/6">
                  {media?.mediaUrl ? (
                    media.mediaType === "video" ? (
                      <video
                        src={media.mediaUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={media.mediaUrl}
                        alt={card.label}
                        fill
                        sizes="50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.28),transparent_42%),linear-gradient(145deg,#12201b,#15171d)] text-primary">
                      <Icon className="size-8" />
                    </div>
                  )}
                  <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl bg-black/72 text-primary backdrop-blur">
                    <Sparkles className="size-4" />
                  </span>
                </div>
                <p className="px-1 pb-1 pt-2 text-sm font-semibold leading-5 text-white">
                  {card.label}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="-mx-1 overflow-hidden">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-white">
            Latest models
          </h2>
          <Link
            href="/studio"
            className="text-xs font-medium text-slate-300 transition hover:text-white"
          >
            More {"->"}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 px-1 pb-1">
          {modelCarouselCards.map((card, index) => (
            <Link
              key={`${card.id}-${index}`}
              href={card.href}
              className="group relative block aspect-[0.86] overflow-hidden rounded-2xl border border-white/10 bg-[#12161f]"
            >
              {card.mediaUrl ? (
                card.mediaType === "video" ? (
                  <video
                    src={card.mediaUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={card.mediaUrl}
                    alt={card.title}
                    fill
                    sizes="50vw"
                    className="object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.2),transparent_30%),linear-gradient(140deg,#123c2f,#102033_55%,#14161c)]" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.2)_45%,rgba(0,0,0,0.86)_100%)]" />

              <div className="absolute left-2 top-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                {card.badge}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <div>
                  <p className="line-clamp-2 text-sm font-semibold leading-4 text-white">
                    {card.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-200">
                    {card.subtitle}
                  </p>
                  <div className="mt-2 inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    Try now
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-white">
            Vireon Suite
          </h2>
          <Link
            href="/studio"
            className="text-xs font-medium text-slate-300 transition hover:text-white"
          >
            More {"->"}
          </Link>
        </div>

        <div className="space-y-3">
          {suiteCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group flex items-center gap-3 rounded-2xl border border-primary/60 bg-[#0d1110] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
            >
              <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-[1rem] bg-white/5">
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
                      sizes="72px"
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/6 text-primary">
                    <Sparkles className="size-6" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold leading-tight text-white">
                  {accentLastWord(card.title)}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-400">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featuredModelCard ? (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-white">
              Latest AI Models
            </h2>
          <Link
            href="/studio"
            className="text-xs font-medium text-slate-300 transition hover:text-white"
          >
            More {"->"}
          </Link>
          </div>

          <article className="rounded-2xl border border-primary/60 bg-[#111316] p-2 shadow-[0_14px_34px_rgba(0,0,0,0.24)]">
            <div className="relative h-36 overflow-hidden rounded-[1rem] border border-white/10">
              {featuredModelCard.mediaUrl ? (
                featuredModelCard.mediaType === "video" ? (
                  <video
                    src={featuredModelCard.mediaUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={featuredModelCard.mediaUrl}
                    alt={featuredModelCard.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                )
              ) : (
                <div className="h-36 w-full bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.25),transparent_42%),linear-gradient(135deg,#123c2f,#0f1722)]" />
              )}
              <div className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white text-black shadow-lg">
                <ArrowUpRight className="size-4" />
              </div>
            </div>

            <div className="px-1.5 pb-1.5 pt-2.5">
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                {latestModels[inspirationTab === "image" ? 0 : 1].badge}
              </div>
              <h3 className="mt-2 text-lg font-semibold leading-tight text-primary">
                {latestModels[inspirationTab === "image" ? 0 : 1].title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-300">
                {latestModels[inspirationTab === "image" ? 0 : 1].subtitle}
              </p>
            </div>
          </article>
        </section>
      ) : null}

      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-white">
            Inspirations
          </h2>

          <div className="inline-flex shrink-0 rounded-full border border-white/10 bg-[#1a1c21] p-0.5">
            {(["image", "video"] as const).map((tab) => {
              const active = inspirationTab === tab;
              const Icon = tab === "image" ? ImageIcon : Clapperboard;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInspirationTab(tab)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs transition ${
                    active
                      ? "bg-white text-black"
                      : "text-slate-300"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab === "image" ? "Image" : "Video"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {activeInspirationCards.map((card, index) => (
            <Link
              key={card.id}
              href={card.href}
              className={`overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#17181c] shadow-[0_12px_30px_rgba(0,0,0,0.22)] ${
                index % 5 === 4 ? "col-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  index % 5 === 4 ? "h-44" : "h-28"
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
                      sizes={index % 5 === 4 ? "100vw" : "50vw"}
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(160deg,#1e293b,#111827)]" />
                )}
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 text-sm font-medium leading-4 text-white">
                  {card.title}
                </p>
                {card.creator ? (
                  <p className="mt-1 text-xs text-slate-400">@{card.creator}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
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
      {words.join(" ")}{" "}
      <span className="text-primary">{lastWord}</span>
    </>
  );
}
