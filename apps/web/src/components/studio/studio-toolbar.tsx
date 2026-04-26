"use client";

import type { ReactNode } from "react";
import { ImageIcon, Sparkles, VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { studioModeConfig, type StudioMode } from "./studio-mode-config";

type StudioToolbarProps = {
  mode: StudioMode;
  onChangeMode: (mode: StudioMode) => void;
};

function ModeButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function StudioToolbar({ mode, onChangeMode }: StudioToolbarProps) {
  const config = studioModeConfig[mode];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_28%),linear-gradient(135deg,#0b1220,#111827,#0f172a)] p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="size-3.5" />
              <span>{config.badge}</span>
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-white sm:text-3xl">
              {config.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              {config.subtitle}
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              {config.helper}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ModeButton
              label="Image"
              icon={<ImageIcon className="size-4" />}
              active={mode === "image"}
              onClick={() => onChangeMode("image")}
            />

            <ModeButton
              label="Video"
              icon={<VideoIcon className="size-4" />}
              active={mode === "video"}
              onClick={() => onChangeMode("video")}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="text-xs text-muted-foreground">
          Shared creator workspace for premium AI image and video production.
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white">
          <span className="size-2 rounded-full bg-primary" />
          Active mode: {mode === "image" ? "Image" : "Video"}
        </div>
      </div>
    </div>
  );
}
