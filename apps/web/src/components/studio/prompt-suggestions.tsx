"use client";

import { promptSuggestions } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

type PromptSuggestionsProps = {
  selectedPrompt: string | null;
  onSelect: (prompt: string) => void;
};

export function PromptSuggestions({
  selectedPrompt,
  onSelect,
}: PromptSuggestionsProps) {
  return (
    <div className="grid gap-3">
      {promptSuggestions.map((prompt) => {
        const isActive = selectedPrompt === prompt;

        return (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className={cn(
              "rounded-[1.25rem] border p-4 text-left text-sm leading-6 transition",
              isActive
                ? "border-primary/25 bg-primary/10 text-white"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            )}
          >
            {prompt}
          </button>
        );
      })}
    </div>
  );
}
