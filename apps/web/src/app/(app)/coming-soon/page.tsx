import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clapperboard,
  FolderOpen,
  Grid2x2,
  ImageIcon,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";

const DEFAULT_FEATURE = "This workspace";

const FEATURE_DETAILS: Record<string, { eyebrow: string; copy: string }> = {
  "All Tools": {
    eyebrow: "Creator toolkit",
    copy: "A fuller tool library is being shaped so every workflow has the right focused surface instead of a rushed shortcut.",
  },
  "Audio Studio": {
    eyebrow: "Sound design",
    copy: "Audio generation, voice references, and sound-led video workflows are being prepared for a cleaner creative flow.",
  },
  Blog: {
    eyebrow: "Learning hub",
    copy: "Articles, release notes, and creative breakdowns will live here once the content experience is ready.",
  },
  "Camera Angle Control": {
    eyebrow: "Video control",
    copy: "Camera direction tools are coming for tighter movement, angle, and shot-planning control.",
  },
  "Character & World": {
    eyebrow: "Asset system",
    copy: "Character, world, and continuity tools are coming so projects can reuse identity and style with less friction.",
  },
  "Character Studio": {
    eyebrow: "Identity builder",
    copy: "Character creation and identity controls are being built for reusable people, looks, and story roles.",
  },
  "Edit Video": {
    eyebrow: "Post generation",
    copy: "Video editing tools are on the way for improving generated clips without leaving the studio.",
  },
  Inspire: {
    eyebrow: "Creative discovery",
    copy: "A better inspiration space is coming with ideas, references, examples, and production-ready starting points.",
  },
  "Lip-Sync": {
    eyebrow: "Performance tools",
    copy: "Lip-sync workflows are being refined for voice-led scenes, dialogue, and expressive character video.",
  },
  "Motion Sync": {
    eyebrow: "Motion tools",
    copy: "Motion matching and controlled movement tools are being prepared for stronger visual continuity.",
  },
  Tutorials: {
    eyebrow: "Guided learning",
    copy: "Tutorials are coming to help creators master prompts, references, models, and repeatable workflows.",
  },
  "World Builder": {
    eyebrow: "Scene systems",
    copy: "World-building tools are coming for reusable locations, atmosphere, props, and visual rules.",
  },
};

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "New Vireon AI creator tools are coming soon.",
};

type ComingSoonPageProps = {
  searchParams: Promise<{
    feature?: string | string[];
  }>;
};

function normalizeFeature(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return DEFAULT_FEATURE;

  try {
    return decodeURIComponent(raw).trim() || DEFAULT_FEATURE;
  } catch {
    return raw.trim() || DEFAULT_FEATURE;
  }
}

export default async function ComingSoonPage({ searchParams }: ComingSoonPageProps) {
  const params = await searchParams;
  const feature = normalizeFeature(params.feature);
  const details = FEATURE_DETAILS[feature] ?? {
    eyebrow: "Coming soon",
    copy: "This area is being designed as a proper creator workflow, with the same level of polish as the rest of Vireon.",
  };

  return (
    <main className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[#070a0d] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-10 h-72 w-72 rounded-full bg-primary/16 blur-3xl" />
        <div className="absolute right-[10%] top-28 h-80 w-80 rounded-full bg-fuchsia-500/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_26px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
            <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="size-3.5" />
                {details.eyebrow}
              </div>

              <h1 className="mt-7 max-w-3xl font-heading text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {feature} is coming soon.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {details.copy} For now, keep creating with the image, video, media, and template areas that are already live.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/studio"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-black shadow-[0_18px_50px_rgba(45,212,191,0.22)] transition hover:scale-[1.01] hover:bg-primary/90"
                >
                  Create now
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/7 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  Explore templates
                </Link>
              </div>
            </div>

            <div className="relative border-t border-white/10 bg-black/20 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0c1116]/90 p-4 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Build status
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">Planned workflow</p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Bell className="size-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Production UI patterns",
                    "Model-aware controls",
                    "Asset and project integration",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3 text-sm text-slate-200"
                    >
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <QuickLink href="/studio" icon={ImageIcon} label="Image" />
                  <QuickLink href="/studio" icon={Clapperboard} label="Video" />
                  <QuickLink href="/assets" icon={FolderOpen} label="Media" />
                  <QuickLink href="/templates" icon={Grid2x2} label="Template" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={Wand2}
            title="Designed with intent"
            copy="Each upcoming page gets its own workflow, states, and controls instead of a placeholder tool."
          />
          <FeatureCard
            icon={Sparkles}
            title="Connected to projects"
            copy="The goal is to make every new area understand assets, prompts, references, and saved work."
          />
          <FeatureCard
            icon={ArrowRight}
            title="Ready paths stay open"
            copy="Image, video, media, and templates remain one click away while the next surfaces are built."
          />
        </div>
      </section>
    </main>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-20 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm font-semibold text-white transition hover:border-primary/35 hover:bg-primary/10"
    >
      <Icon className="size-4 text-primary" />
      <span>{label}</span>
    </Link>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  copy,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
}) {
  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-white/8 text-primary">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-4 text-base font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
    </article>
  );
}
