"use client";

import { cn } from "@/lib/utils";

type GenerationProgressProps = {
  value: number;
  label?: string;
  className?: string;
};

export function GenerationProgress({
  value,
  label = "Generation progress",
  className,
}: GenerationProgressProps) {
  const progress = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className={cn(
        "rounded-xl border border-[#2dd4bf]/25 bg-[#061817]/90 p-3 text-[#b7fff5] shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8df5e8]/75">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold text-white">
          {progress}%
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#2dd4bf,#a7f3d0,#f0fdfa)] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-white/55">
        Estimated from the active processing window. It will finish early as
        soon as the model returns the result.
      </p>
    </div>
  );
}
