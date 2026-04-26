"use client";

import { motionIntensityOptions } from "@/lib/video-studio-data";
import { cn } from "@/lib/utils";

type MotionIntensitySelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MotionIntensitySelector({
  value,
  onChange,
}: MotionIntensitySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {motionIntensityOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "inline-flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-center text-sm font-medium leading-none transition",
            value === item.value
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
