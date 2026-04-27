"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Clapperboard,
  ImageIcon,
  Sparkles,
  WandSparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { heroSlides } from "@/lib/mock-data";

export function HomeHero() {
  const slide = heroSlides[0];

  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#071311] px-5 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:px-7 sm:py-8 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_24%),radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.12),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_50%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
        <div>
          <Badge className="rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-[11px] text-primary hover:bg-primary/10">
            <Sparkles className="mr-1 size-3.5" />
            {slide.eyebrow}
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-5 max-w-4xl font-heading text-[2.7rem] font-bold tracking-tight text-white sm:text-5xl lg:text-[4.5rem] lg:leading-[0.98]"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
          >
            {slide.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link href="/studio">
              <Button className="h-12 w-full rounded-full bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90 sm:w-auto">
                {slide.ctaPrimary}
              </Button>
            </Link>

            <Link href="/explore">
              <Button
                variant="outline"
                className="h-12 w-full rounded-full border-white/10 bg-white/5 px-6 text-base text-white hover:bg-white/10 sm:w-auto"
              >
                {slide.ctaSecondary}
                <ArrowUpRight className="ml-1 size-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <HeroStat value="Image" label="Still generation" />
            <HeroStat value="Video" label="Motion clips" />
            <HeroStat value="Projects" label="Scene workflows" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.9rem] border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
            <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,23,21,0.92),rgba(6,17,16,0.98))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-primary/80">
                    Featured toolset
                  </div>
                  <div className="mt-3 font-heading text-3xl font-bold text-white sm:text-[2.3rem]">
                    Image. Video. Scenes.
                  </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Vireon Studio
                </div>
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                A calmer creative system for prompt-based image generation,
                cinematic video, and scene-driven storytelling.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <PreviewPill
                  icon={<ImageIcon className="size-4" />}
                  title="AI image"
                  subtitle="Prompt rich"
                />
                <PreviewPill
                  icon={<Clapperboard className="size-4" />}
                  title="AI video"
                  subtitle="Motion led"
                />
                <PreviewPill
                  icon={<WandSparkles className="size-4" />}
                  title="Restyle"
                  subtitle="Iterate fast"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SurfaceMetric
              value="20M+"
              label="Visual generations imagined across creator workflows"
            />
            <SurfaceMetric
              value="Studio"
              label="One place to move from first prompt to polished output"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
      <div className="text-base font-semibold text-white sm:text-lg">{value}</div>
      <div className="mt-1 text-[11px] leading-5 text-slate-400 sm:text-xs">
        {label}
      </div>
    </div>
  );
}

function PreviewPill({
  icon,
  title,
  subtitle
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/25 px-3 py-3">
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <div className="mt-3 text-sm font-medium text-white">{title}</div>
      <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
    </div>
  );
}

function SurfaceMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.55rem] border border-white/10 bg-white/5 p-4">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{label}</div>
    </div>
  );
}
