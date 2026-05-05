"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Copy,
  Maximize2,
  Search,
  Wand2,
  X,
} from "lucide-react";

import { HeaderAuth } from "@/components/layout/header-auth";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { StudioHomeSidebar } from "@/components/studio/studio-home-sidebar";
import { PROMPT_TEMPLATES } from "@/lib/prompts/prompt-templates";
import { cn } from "@/lib/utils";

const galleryMedia: Record<
  string,
  { image: string; tone: string; height: string; previewVideo?: string }
> = {
  "cinematic-portrait": {
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85",
    tone: "from-rose-500/35 via-black/10 to-black/80",
    height: "h-44 sm:h-52",
  },
  "luxury-product-ad": {
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    tone: "from-emerald-500/24 via-black/10 to-black/85",
    height: "h-44",
  },
  "afrofuturist-cityscape": {
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
    tone: "from-cyan-500/28 via-black/10 to-black/85",
    height: "h-52 sm:h-60",
  },
  "streetwear-editorial": {
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
    tone: "from-fuchsia-500/24 via-black/10 to-black/80",
    height: "h-48",
  },
  "architectural-interior": {
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85",
    tone: "from-amber-500/24 via-black/10 to-black/85",
    height: "h-56",
  },
  "fantasy-character-poster": {
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=85",
    tone: "from-violet-500/26 via-black/10 to-black/85",
    height: "h-48 sm:h-64",
  },
  "food-commercial-shot": {
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",
    tone: "from-orange-500/24 via-black/10 to-black/85",
    height: "h-44",
  },
  "travel-poster-coastline": {
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
    tone: "from-sky-500/24 via-black/10 to-black/85",
    height: "h-52",
  },
  "fashion-runway-clip": {
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
    tone: "from-pink-500/28 via-black/10 to-black/85",
    height: "h-56",
  },
  "epic-story-opening": {
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85",
    tone: "from-yellow-500/22 via-black/10 to-black/85",
    height: "h-48",
  },
  "product-launch-reveal": {
    image:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=900&q=85",
    tone: "from-lime-500/24 via-black/10 to-black/85",
    height: "h-44",
  },
  "drone-city-flyover": {
    image:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=85",
    tone: "from-teal-500/24 via-black/10 to-black/85",
    height: "h-52",
  },
  "music-video-performance": {
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
    tone: "from-purple-500/26 via-black/10 to-black/85",
    height: "h-48",
  },
  "nature-documentary-moment": {
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85",
    tone: "from-emerald-500/24 via-black/10 to-black/85",
    height: "h-60",
  },
  "startup-office-broll": {
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    tone: "from-blue-500/24 via-black/10 to-black/85",
    height: "h-44",
  },
};

const VIDEO_PREVIEW_SRC =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

type GalleryTemplate = {
  id: string;
  title: string;
  type: "image" | "video";
  category: string;
  prompt: string;
  negativePrompt?: string | null;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  modelId?: string | null;
  settings?: Record<string, unknown> | null;
};

function fallbackTemplates(): GalleryTemplate[] {
  return PROMPT_TEMPLATES.map((template) => ({
    ...template,
    previewUrl: galleryMedia[template.id]?.image,
  }));
}

function stringSetting(
  settings: Record<string, unknown> | null | undefined,
  key: string,
  fallback: string
) {
  const value = settings?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberSetting(
  settings: Record<string, unknown> | null | undefined,
  key: string,
  fallback: number
) {
  const value = settings?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mediaForTemplate(template: GalleryTemplate) {
  const fallback = galleryMedia[template.id];
  const previewUrl = template.previewUrl || fallback?.image || "";
  const thumbnailUrl = template.thumbnailUrl || previewUrl;

  return {
    image: thumbnailUrl,
    previewUrl,
    tone: fallback?.tone ?? "from-primary/18 via-black/10 to-black/85",
    height: fallback?.height ?? "h-48",
    previewVideo:
      template.type === "video" && previewUrl.toLowerCase().endsWith(".mp4")
        ? previewUrl
        : undefined,
  };
}

export function TemplatesGalleryClient() {
  const router = useRouter();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [templates, setTemplates] = useState<GalleryTemplate[]>(fallbackTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<GalleryTemplate | null>(null);
  const workspaceName =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Vireon";

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedTemplate(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedTemplate]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();

        if (res.ok && Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      } catch {
        setTemplates(fallbackTemplates);
      }
    }

    void loadTemplates();
  }, []);

  function handleUseTemplate(template: GalleryTemplate) {
    const settings = template.settings ?? {};

    if (template.type === "video") {
      window.sessionStorage.setItem("vireon_studio_open_mode", "video");
      window.localStorage.setItem(
        "vireon_video_studio_session_state",
        JSON.stringify({
          modelId: template.modelId || "kwaivgi/kling-v3-video",
          prompt: template.prompt,
          negativePrompt: template.negativePrompt,
          duration: String(numberSetting(settings, "duration", 5)),
          aspectRatio: stringSetting(settings, "aspectRatio", "16:9"),
          motionIntensity: stringSetting(settings, "motionIntensity", "medium"),
          cameraMove: stringSetting(settings, "cameraMove", "Slow Push In"),
          styleStrength: stringSetting(settings, "styleStrength", "medium"),
          motionGuidance: numberSetting(settings, "motionGuidance", 6),
          shotType: stringSetting(settings, "shotType", "Wide Shot"),
          fps: String(numberSetting(settings, "fps", 24)),
          draftTitle: template.title,
        })
      );
    } else {
      window.sessionStorage.setItem("vireon_studio_open_mode", "image");
      window.localStorage.setItem(
        "vireon_studio_session_state",
        JSON.stringify({
          modelId: template.modelId || "openai/gpt-image-2",
          prompt: template.prompt,
          negativePrompt: template.negativePrompt,
          referenceImageUrl: "",
          style: stringSetting(settings, "style", "Cinematic"),
          aspectRatio: stringSetting(settings, "aspectRatio", "1:1"),
          qualityMode: stringSetting(settings, "qualityMode", "high"),
          promptBoost:
            typeof settings.promptBoost === "boolean" ? settings.promptBoost : true,
          seed: typeof settings.seed === "number" ? settings.seed : null,
          steps: numberSetting(settings, "steps", 30),
          guidance: numberSetting(settings, "guidance", 7.5),
          draftTitle: template.title,
        })
      );
    }

    router.push("/studio");
  }

  function handleCopyPrompt(template: GalleryTemplate) {
    void navigator.clipboard?.writeText(template.prompt);
  }

  const selectedMedia = selectedTemplate ? mediaForTemplate(selectedTemplate) : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050606] text-white">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#080a0b]/90 backdrop-blur-xl transition-[left] duration-300",
          isSidebarOpen ? "lg:left-52" : "lg:left-15"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-2 lg:hidden">
            <span className="relative flex size-9 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <Image src="/logo.png" alt="Vireon" fill sizes="36px" className="object-cover" />
            </span>
            <span className="truncate text-sm font-bold">Vireon</span>
          </Link>

          <div className="hidden min-w-0 items-center gap-2 lg:flex">
            <span className="relative flex size-9 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <Image src="/logo.png" alt="Vireon" fill sizes="36px" className="object-cover" />
            </span>
            <span className="truncate text-sm font-semibold">
              {workspaceName}&apos;s workspace
            </span>
            <ChevronDown className="size-3.5 text-slate-500" />
          </div>

          <div className="hidden items-center gap-2 text-xs lg:flex">
            <span className="text-white">Inspire</span>
            <span className="text-slate-600">-</span>
            <span className="text-slate-400">Template</span>
          </div>

          <div className="ml-auto hidden h-10 min-w-64 max-w-md flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-slate-400 md:flex">
            <Search className="size-4" />
            <span className="truncate">Search templates, prompts, visuals...</span>
          </div>

          <div className="ml-auto shrink-0 md:ml-0">
            <HeaderAuth />
          </div>
        </div>
      </header>

      <StudioHomeSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        className="fixed inset-y-0 left-0 z-40 hidden lg:block"
      />

      <main
        className={cn(
          "px-3 pb-28 pt-20 transition-[padding] duration-300 sm:px-4 lg:pr-4",
          isSidebarOpen ? "lg:pl-56" : "lg:pl-19"
        )}
      >
        <div className="mb-4 flex items-end justify-between gap-3 lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Inspire
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Templates</h1>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            {templates.length}
          </span>
        </div>

        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 2xl:columns-5">
          {templates.map((template, index) => {
            const media = mediaForTemplate(template);

            return (
              <article
                key={template.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTemplate(template)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTemplate(template);
                  }
                }}
                className="group mb-3 break-inside-avoid overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#181a1c] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/45"
              >
                <div className={cn("relative overflow-hidden", media.height)}>
                  {template.type === "video" && media.previewVideo ? (
                    <video
                      src={media.previewVideo}
                      muted
                      loop
                      playsInline
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={media.image}
                      alt={template.title}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      loading={index < 6 ? "eager" : "lazy"}
                    />
                  )}
                  <div className={cn("absolute inset-0 bg-gradient-to-b", media.tone)} />
                  <div className="absolute left-2 top-2 flex gap-1.5">
                    <span className="rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold capitalize text-white backdrop-blur">
                      {template.type}
                    </span>
                    <span className="hidden rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur min-[390px]:inline">
                      {template.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Recreate ${template.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUseTemplate(template);
                    }}
                    className="absolute left-1/2 top-1/2 hidden h-10 -translate-x-1/2 -translate-y-1/2 scale-95 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-black opacity-0 shadow-[0_14px_38px_rgba(16,185,129,0.32)] transition duration-200 hover:bg-[#39f0b0] focus:scale-100 focus:opacity-100 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 sm:inline-flex"
                  >
                    Recreate
                  </button>
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-sm font-bold leading-5 text-white">
                      {template.title}
                    </h2>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUseTemplate(template);
                      }}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-primary transition hover:bg-primary hover:text-black"
                      aria-label={`Use ${template.title}`}
                    >
                      <Wand2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                    {template.prompt}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {selectedTemplate && selectedMedia ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-3 py-5 backdrop-blur-xl sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-preview-title"
          onClick={() => setSelectedTemplate(null)}
        >
          <button
            type="button"
            aria-label="Close template preview"
            onClick={() => setSelectedTemplate(null)}
            className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/16 text-white transition hover:bg-white/25 lg:right-8 lg:top-8"
          >
            <X className="size-5" />
          </button>

          <div
            className="grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#151719] shadow-[0_34px_110px_rgba(0,0,0,0.58)] lg:grid-cols-[minmax(0,1fr)_30rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-0 items-center justify-center bg-[#101112] p-4 sm:p-8">
              <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
                {selectedTemplate.type === "video" ? (
                  <video
                    src={selectedMedia.previewVideo ?? VIDEO_PREVIEW_SRC}
                    poster={selectedMedia.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="max-h-[62vh] w-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedMedia.previewUrl || selectedMedia.image}
                    alt={selectedTemplate.title}
                    className="max-h-[62vh] w-full object-contain"
                  />
                )}

                <button
                  type="button"
                  aria-label="Expand preview"
                  className="absolute left-1/2 top-4 hidden size-10 -translate-x-1/2 items-center justify-center rounded-xl bg-white/18 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
                >
                  <Maximize2 className="size-5" />
                </button>
              </div>
            </div>

            <aside className="flex min-h-0 flex-col border-t border-white/10 bg-[#1b1d1f] p-5 lg:border-l lg:border-t-0 lg:p-7">
              <div>
                <h2 id="template-preview-title" className="text-xl font-bold text-white">
                  {selectedTemplate.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Details</p>
              </div>

              <div className="mt-7 space-y-8 overflow-y-auto pr-1">
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Prompt
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(selectedTemplate)}
                      className="flex size-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/8 hover:text-white"
                      aria-label="Copy prompt"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-6 text-white">
                    {selectedTemplate.prompt}
                  </p>
                </section>

                <section>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    References
                  </h3>
                  <img
                    src={selectedMedia.image}
                    alt=""
                    className="size-16 rounded-lg object-cover"
                  />
                </section>

                <section>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Settings
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-white/12 px-2 py-1 text-[11px] font-bold text-white">
                      {selectedTemplate.type === "video" ? "Kling V3 Video" : "GPT Image 2"}
                    </span>
                    <span className="rounded-md bg-white/12 px-2 py-1 text-[11px] font-bold text-white">
                      {selectedTemplate.type === "video" ? "5s" : "High"}
                    </span>
                    <span className="rounded-md bg-white/12 px-2 py-1 text-[11px] font-bold text-white">
                      {selectedTemplate.type === "video" ? "16:9" : "1:1"}
                    </span>
                    <span className="rounded-md bg-white/12 px-2 py-1 text-[11px] font-bold text-white">
                      {selectedTemplate.category}
                    </span>
                  </div>
                </section>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#ec22c4] text-sm font-bold text-white shadow-[0_18px_48px_rgba(236,34,196,0.25)] transition hover:bg-[#ff33d4]"
                >
                  Recreate
                </button>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      <MobileBottomNav />
    </div>
  );
}
