import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ImageIcon, Video, WandSparkles } from "lucide-react";

export function ImageToVideoWorkflowCard() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,24,20,0.98),rgba(4,12,11,0.98))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <WandSparkles className="size-3.5" />
            Image-to-video workflow
          </div>

          <h2 className="mt-4 max-w-xl font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Turn strong still images into motion that feels intentional.
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
            Choose a source image, carry its mood into video, and keep iterating
            inside the same creative flow instead of rebuilding your idea from
            scratch.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/assets"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground transition hover:bg-primary/90"
            >
              Open media library
            </Link>

            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Go to studio
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          <Step
            index="01"
            icon={<ImageIcon className="size-5 text-primary" />}
            title="Generate or pick a source image"
            text="Start from a polished visual in your library or create one from a prompt."
          />
          <Step
            index="02"
            icon={<WandSparkles className="size-5 text-primary" />}
            title="Animate the image into motion"
            text="Use the image as your source so the video generation keeps the same visual identity."
          />
          <Step
            index="03"
            icon={<Video className="size-5 text-primary" />}
            title="Review, reuse, publish"
            text="Keep iterating, save the clip, or build from it again in your next idea."
          />
        </div>
      </div>
    </section>
  );
}

function Step({
  index,
  icon,
  title,
  text
}: {
  index: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          {icon}
        </div>
        <span className="text-xs tracking-[0.24em] text-slate-500">{index}</span>
      </div>

      <p className="mt-4 text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}
