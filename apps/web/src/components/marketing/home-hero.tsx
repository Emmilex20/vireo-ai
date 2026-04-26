"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { heroSlides } from "@/lib/mock-data";

export function HomeHero() {
  const slide = heroSlides[0];

  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_55%)]" />

      <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Badge className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-primary hover:bg-primary/10">
            <Sparkles className="mr-1 size-3.5" />
            {slide.eyebrow}
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-5 max-w-3xl font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            {slide.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link href="/studio">
              <Button className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                {slide.ctaPrimary}
              </Button>
            </Link>

            <Link href="/explore">
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
              >
                {slide.ctaSecondary}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
            <div className="rounded-3xl border border-emerald-400/20 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_38%),rgba(255,255,255,0.03)] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-primary/80">
                Featured toolset
              </div>
              <div className="mt-3 font-heading text-2xl font-bold text-white">
                Image. Video. Motion.
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Build creator-ready visual content through one polished AI workflow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-white">20M+</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Generated assets vision
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-white">Studio</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Built for creators at scale
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
