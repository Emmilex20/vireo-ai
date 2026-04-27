import { quickTools } from "@/lib/mock-data";

export function QuickTools() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-8">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.24em] text-primary/80">
          Core creative modes
        </div>
        <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Start with the tools creators actually come back for.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
          Generate still visuals, create short motion pieces, restyle ideas, and
          move through connected workflows that keep your best outputs in play.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickTools.slice(0, 4).map((tool, index) => {
          const Icon = tool.icon;

          return (
            <article
              key={tool.id}
              className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="size-5" />
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-slate-300">
                  0{index + 1}
                </div>
              </div>

              <h3 className="mt-5 font-heading text-xl font-semibold text-white">
                {tool.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {tool.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
