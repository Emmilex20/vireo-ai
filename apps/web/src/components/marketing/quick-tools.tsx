import { SectionHeading } from "@/components/shared/section-heading"
import { quickTools } from "@/lib/mock-data"

export function QuickTools() {
  return (
    <section className="mt-10">
      <SectionHeading
        title="Create with powerful tools"
        description="Start from the core creative modes users will care about most."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {quickTools.map((tool) => {
          const Icon = tool.icon

          return (
            <article
              key={tool.id}
              className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.07]"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="size-5" />
              </div>

              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                {tool.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {tool.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
