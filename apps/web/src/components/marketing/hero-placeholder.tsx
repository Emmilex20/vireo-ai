import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroPlaceholder() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_22%)]" />

      <div className="relative z-10 max-w-3xl">
        <Badge className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-primary hover:bg-primary/10">
          Batch 2 Foundation Ready
        </Badge>

        <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Build the next generation AI creation platform.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Vireon AI is being built for image generation, video creation,
          motion tools, restyling, asset management, and creator publishing.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
            Start Creating
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
          >
            View Explore
          </Button>
        </div>
      </div>
    </section>
  );
}