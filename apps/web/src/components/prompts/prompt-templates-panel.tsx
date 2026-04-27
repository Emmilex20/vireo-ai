"use client";

import { useMemo, useState } from "react";
import { PROMPT_TEMPLATES } from "@/lib/prompts/prompt-templates";

type Props = {
  type?: "image" | "video";
  onUseTemplate: (template: {
    prompt: string;
    negativePrompt?: string;
  }) => void;
};

export function PromptTemplatesPanel({ type, onUseTemplate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const templates = type
    ? PROMPT_TEMPLATES.filter((template) => template.type === type)
    : PROMPT_TEMPLATES;
  const visibleTemplates = useMemo(
    () => (expanded ? templates : templates.slice(0, 2)),
    [expanded, templates]
  );
  const hasMore = templates.length > 2;

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Prompt templates</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Start with a polished prompt, then customize it.
          </p>
        </div>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white transition hover:bg-white/10"
          >
            {expanded ? "Show less" : `More ${templates.length - 2}`}
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        {visibleTemplates.map((template) => (
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
