"use client";

import { cameraMoves } from "@/lib/video-studio-data";
import { cn } from "@/lib/utils";

type CameraMoveSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CameraMoveSelector({
  value,
  onChange,
}: CameraMoveSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {cameraMoves.map((move) => (
        <button
          key={move}
          type="button"
          onClick={() => onChange(move)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-center text-sm leading-none transition",
            value === move
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          )}
        >
          {move}
        </button>
      ))}
    </div>
  );
}
