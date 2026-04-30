"use client";

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
  { label: "Image", icon: ImageIcon, href: "/studio" },
  { label: "Video", icon: Clapperboard, href: "/studio" },
  { label: "Character", icon: Users, href: "/creators" },
  { label: "World", icon: Compass, href: "/explore" },
  { label: "Audio", icon: AudioLines, href: "/studio" },
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

  return (
    <div className="space-y-6 sm:hidden">
      {showOffer ? (
        <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#101214] shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
          <div className="relative p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_45%)]" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-base leading-7 text-white">
                  Limited-time offer! Unlock a year of creator workflow upgrades
                  with faster models and richer video controls.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  View plans
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowOffer(false)}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-muted-foreground"
                aria-label="Dismiss offer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        <div className="space-y-3">
          <h1 className="font-heading text-[2.8rem] font-bold leading-[0.96] tracking-tight text-white">
            What would you like
            <br />
            to{" "}
            <span className="bg-[linear-gradient(90deg,#f0abfc,#f472b6,#c084fc)] bg-clip-text text-transparent">
              create
            </span>{" "}
            today?
          </h1>
          <p className="max-w-sm text-sm leading-6 text-slate-400">
            Start with a focused tool, borrow inspiration from real creator
            work, and move straight into the studio.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.slice(0, 2).map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-[1.7rem] border border-white/10 bg-[#17181c] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white/6 text-white">
                  <Icon className="size-5" />
                </div>
                <div className="mt-5 text-center text-2xl font-semibold text-white">
                  {action.label}
                </div>
              </Link>
            );
          })}

          {quickActions.slice(2).map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-[1.35rem] border border-white/10 bg-[#17181c] px-4 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-white/6 text-white">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="text-xl font-medium text-white">
                    {action.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="-mx-1 overflow-hidden">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-heading text-[1.65rem] font-semibold tracking-tight text-white">
            Latest models
          </h2>
          <Link
            href="/studio"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            More {"->"}
          </Link>
        </div>

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {modelCarouselCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group relative block h-[16.5rem] w-[88%] flex-none snap-start overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#12161f]"
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
                  <img
                    src={card.mediaUrl}
                    alt={card.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.2),transparent_30%),linear-gradient(140deg,#123c2f,#102033_55%,#14161c)]" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.2)_45%,rgba(0,0,0,0.86)_100%)]" />

              <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {card.badge}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="max-w-[85%]">
                  <p className="text-[1.8rem] font-semibold leading-[1.04] text-white">
                    {card.title}
                  </p>
                  <p className="mt-2 text-base leading-6 text-slate-200">
                    {card.subtitle}
                  </p>
                  <div className="mt-4 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                    Try now
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[2rem] font-semibold tracking-tight text-white">
            Vireon Suite
          </h2>
          <Link
            href="/studio"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            More {"->"}
          </Link>
        </div>

        <div className="space-y-3">
          {suiteCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group flex items-center gap-4 rounded-[1.8rem] border border-primary/70 bg-[#0d1110] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
            >
              <div className="size-24 shrink-0 overflow-hidden rounded-[1.35rem] bg-white/5">
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
                    <img
                      src={card.mediaUrl}
                      alt={card.title}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/6 text-primary">
                    <Sparkles className="size-7" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[1.75rem] font-semibold leading-tight text-white">
                  {accentLastWord(card.title)}
                </p>
                <p className="mt-2 text-base leading-6 text-slate-400">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featuredModelCard ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[2rem] font-semibold tracking-tight text-white">
              Latest AI Models
            </h2>
          <Link
            href="/studio"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            More {"->"}
          </Link>
          </div>

          <article className="rounded-[1.9rem] border border-primary/70 bg-[#111316] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
            <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10">
              {featuredModelCard.mediaUrl ? (
                featuredModelCard.mediaType === "video" ? (
                  <video
                    src={featuredModelCard.mediaUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <img
                    src={featuredModelCard.mediaUrl}
                    alt={featuredModelCard.title}
                    className="h-56 w-full object-cover"
                  />
                )
              ) : (
                <div className="h-56 w-full bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.25),transparent_42%),linear-gradient(135deg,#123c2f,#0f1722)]" />
              )}
              <div className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white text-black shadow-lg">
                <ArrowUpRight className="size-5" />
              </div>
            </div>

            <div className="px-2 pb-2 pt-4">
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {latestModels[inspirationTab === "image" ? 0 : 1].badge}
              </div>
              <h3 className="mt-3 text-[2rem] font-semibold leading-tight text-primary">
                {latestModels[inspirationTab === "image" ? 0 : 1].title}
              </h3>
              <p className="mt-2 text-lg leading-7 text-slate-300">
                {latestModels[inspirationTab === "image" ? 0 : 1].subtitle}
              </p>
            </div>
          </article>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-[2rem] font-semibold tracking-tight text-white">
            Inspirations
          </h2>

          <div className="inline-flex rounded-full border border-white/10 bg-[#1a1c21] p-1">
            {(["image", "video"] as const).map((tab) => {
              const active = inspirationTab === tab;
              const Icon = tab === "image" ? ImageIcon : Clapperboard;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInspirationTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-white text-black"
                      : "text-slate-300"
                  }`}
                >
                  <Icon className="size-4" />
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
              className={`overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#17181c] shadow-[0_14px_36px_rgba(0,0,0,0.22)] ${
                index % 5 === 4 ? "col-span-2" : ""
              }`}
            >
              <div
                className={`overflow-hidden ${
                  index % 5 === 4 ? "h-64" : "h-36"
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
                    <img
                      src={card.mediaUrl}
                      alt={card.title}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(160deg,#1e293b,#111827)]" />
                )}
              </div>
              <div className="p-3.5">
                <p className="line-clamp-2 text-lg font-medium text-white">
                  {card.title}
                </p>
                {card.creator ? (
                  <p className="mt-1 text-sm text-slate-400">@{card.creator}</p>
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
