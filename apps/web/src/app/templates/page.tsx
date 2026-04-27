import { PROMPT_TEMPLATES } from "@/lib/prompts/prompt-templates";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";

export default function TemplatesPage() {
  return (
    <PublicSiteFrame>
      <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Prompt Library
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Prompt templates
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Use these templates to create better images and videos faster.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PROMPT_TEMPLATES.map((template) => (
              <article
                key={template.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                    {template.type}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                    {template.category}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-white">
                  {template.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {template.prompt}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicSiteFrame>
  );
}
