"use client";

import { Check, ImagePlus, Sparkles } from "lucide-react";
import {
  listReplicateImageModels,
  type ReplicateImageModelId,
} from "@/lib/ai/providers/replicate-image-models";
import { cn } from "@/lib/utils";

type ImageModelSelectorProps = {
  value: ReplicateImageModelId;
  onChange: (value: ReplicateImageModelId) => void;
};

const models = listReplicateImageModels();

export function ImageModelSelector({
  value,
  onChange,
}: ImageModelSelectorProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {models.map((model) => {
        const selected = model.id === value;

        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onChange(model.id)}
            className={cn(
              "rounded-[1.4rem] border p-4 text-left transition",
              selected
                ? "border-primary/30 bg-primary/10 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]"
                : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{model.label}</p>
                  {selected ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      <Check className="size-3" />
                      Selected
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {model.description}
                </p>
              </div>

              <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/80">
                {model.defaultAspectRatio}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                <Sparkles className="size-3" />
                Default ratio {model.defaultAspectRatio}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                <ImagePlus className="size-3" />
                {model.supports.referenceImage
                  ? "Reference image supported"
                  : "Prompt-only generation"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
