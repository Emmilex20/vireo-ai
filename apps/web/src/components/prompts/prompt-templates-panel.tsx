"use client";

import { PROMPT_TEMPLATES } from "@/lib/prompts/prompt-templates";

type Props = {
  type?: "image" | "video";
  onUseTemplate: (template: {
    prompt: string;
    negativePrompt?: string;
  }) => void;
};

export function PromptTemplatesPanel({ type, onUseTemplate }: Props) {
  const templates = type
    ? PROMPT_TEMPLATES.filter((template) => template.type === type)
    : PROMPT_TEMPLATES;

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div>
        <p className="text-sm font-semibold text-white">Prompt templates</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Start with a polished prompt, then customize it.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() =>
              onUseTemplate({
                prompt: template.prompt,
                negativePrompt: template.negativePrompt
              })
            }
            className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">
                {template.title}
              </p>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                {template.category}
              </span>
            </div>

            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {template.prompt}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
