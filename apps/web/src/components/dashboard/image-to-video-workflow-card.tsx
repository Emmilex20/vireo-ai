import type { ReactNode } from "react";
import Link from "next/link";
import { ImageIcon, Video, WandSparkles } from "lucide-react";

export function ImageToVideoWorkflowCard() {
  return (
    <section className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-black/20 px-3 py-1 text-xs text-primary">
        <WandSparkles className="size-3.5" />
        Image-to-video workflow
      </div>

      <h2 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-white">
        Turn your generated images into cinematic videos
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        Pick an image from your media library, open it, and use Animate this
        image to create motion-driven video generations.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Step
          icon={<ImageIcon className="size-5 text-primary" />}
          title="1. Generate image"
          text="Create or choose a strong image from your assets."
        />
        <Step
          icon={<WandSparkles className="size-5 text-primary" />}
          title="2. Animate it"
          text="Attach it as your source image for video generation."
        />
        <Step
          icon={<Video className="size-5 text-primary" />}
          title="3. Review video"
          text="Reuse, publish, save, or continue iterating."
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/assets"
          className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15"
        >
          Open media library
        </Link>

        <Link
          href="/studio"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Go to studio
        </Link>
      </div>
    </section>
  );
}

function Step({
  icon,
  title,
  text
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      {icon}
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
