"use client";

import { cn } from "@/lib/utils";
import {
  styleStrengthOptions,
  videoFpsOptions,
  videoShotTypes,
} from "@/lib/video-studio-data";

type VideoAdvancedSettingsProps = {
  open: boolean;
  onToggleOpen: () => void;
  styleStrength: string;
  onStyleStrengthChange: (value: string) => void;
  motionGuidance: number;
  onMotionGuidanceChange: (value: number) => void;
  shotType: string;
  onShotTypeChange: (value: string) => void;
  fps: string;
  onFpsChange: (value: string) => void;
};

export function VideoAdvancedSettings({
  open,
  onToggleOpen,
  styleStrength,
  onStyleStrengthChange,
  motionGuidance,
  onMotionGuidanceChange,
  shotType,
  onShotTypeChange,
  fps,
  onFpsChange,
}: VideoAdvancedSettingsProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
            Advanced video settings
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Fine-tune style behavior, motion control, and cinematic output
            details.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleOpen}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/20 hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open ? (
        <div className="mt-6 grid gap-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Style strength
            </label>
            <div className="grid grid-cols-3 gap-3">
              {styleStrengthOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onStyleStrengthChange(item.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    styleStrength === item.value
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Motion guidance: {motionGuidance}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={motionGuidance}
              onChange={(e) => onMotionGuidanceChange(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Higher motion guidance pushes the model toward stronger movement
              adherence.
            </p>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Shot type
            </label>
            <div className="flex flex-wrap gap-3">
              {videoShotTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onShotTypeChange(item)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    shotType === item
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Frame rate
            </label>
            <div className="grid grid-cols-3 gap-3">
              {videoFpsOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onFpsChange(item.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    fps === item.value
                      ? "border-white/15 bg-white text-black"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
