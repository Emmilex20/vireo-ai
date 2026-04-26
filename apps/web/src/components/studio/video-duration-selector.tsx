"use client";

import { videoDurations } from "@/lib/video-studio-data";
import { cn } from "@/lib/utils";

type VideoDurationSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function VideoDurationSelector({
  value,
  onChange,
}: VideoDurationSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {videoDurations.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "inline-flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-center text-sm font-medium leading-none transition",
            value === item.value
              ? "border-white/15 bg-white text-black"
              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
