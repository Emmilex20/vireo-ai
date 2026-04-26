import { recentImageGenerations } from "@/lib/studio-data";
import { StudioSectionTitle } from "@/components/shared/studio-section-title";

export function RecentGenerations() {
  return (
    <section className="mt-8">
      <StudioSectionTitle
        title="Recent image ideas"
        subtitle="A preview of what your generation history will look like."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {recentImageGenerations.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
          >
            <div className="h-44 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_22%),linear-gradient(135deg,#111827,#1f2937,#0f172a)]" />
            <div className="p-4">
              <h3 className="font-(family-name:--font-heading) text-base font-semibold text-white">
                {item.title}
              </h3>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  {item.style}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  {item.ratio}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}