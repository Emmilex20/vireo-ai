"use client";

import { imageStyles } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

type StylePresetsProps = {
  value: string;
  onChange: (style: string) => void;
};

export function StylePresets({ value, onChange }: StylePresetsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {imageStyles.map((style) => (
        <button
          key={style}
          type="button"
          onClick={() => onChange(style)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition",
            value === style
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          )}
        >
          {style}
        </button>
      ))}
    </div>
  );
}
