import type { ReactNode } from "react";
import Link from "next/link";
import { Images, Sparkles, Video } from "lucide-react";

export function LandingConversionSection() {
  return (
    <section className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-black/20 px-3 py-1 text-xs text-primary">
          <Sparkles className="size-3.5" />
          Create with Vireon AI
        </div>

        <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          Generate images, animate them into videos, and build full AI scenes
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Vireon AI helps creators turn ideas into visual content using image generation,
          image-to-video, public galleries, creator profiles, and multi-scene video projects.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/studio"
            className="rounded-full border border-primary/20 bg-primary px-5 py-2 text-sm text-primary-foreground transition hover:bg-primary/90"
          >
            Start creating
          </Link>

          <Link
            href="/gallery"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Explore gallery
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          <a href="/gallery" className="text-white transition hover:text-primary">
            AI Gallery
          </a>
          <a href="/creators" className="text-white transition hover:text-primary">
            Creators
          </a>
          <a href="/pricing" className="text-white transition hover:text-primary">
            Pricing
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Feature
          icon={<Images className="size-5 text-primary" />}
          title="AI images"
          text="Generate polished images from prompts and save them to your library."
        />
        <Feature
          icon={<Video className="size-5 text-primary" />}
          title="Image-to-video"
          text="Animate your best images into cinematic video clips."
        />
        <Feature
          icon={<Sparkles className="size-5 text-primary" />}
          title="Multi-scene projects"
          text="Build longer videos scene by scene and export one final video."
        />
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  text
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      {icon}
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
