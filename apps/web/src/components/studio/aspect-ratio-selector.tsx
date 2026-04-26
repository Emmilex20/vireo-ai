"use client";

import { aspectRatios } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

type AspectRatioSelectorProps = {
  value: string;
  onChange: (ratio: string) => void;
};

export function AspectRatioSelector({
  value,
  onChange,
}: AspectRatioSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {aspectRatios.map((ratio) => (
        <button
          key={ratio.value}
          type="button"
          onClick={() => onChange(ratio.value)}
          className={cn(
            "min-h-12 rounded-2xl border px-4 py-3 text-sm font-medium transition",
            value === ratio.value
              ? "border-white/15 bg-white text-black"
              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          )}
        >
          {ratio.label}
        </button>
      ))}
    </div>
  );
}
