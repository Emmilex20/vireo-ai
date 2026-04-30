"use client";

import type { ReplicateVideoModelConfig } from "@/lib/ai/providers/replicate-video-models";
import { cn } from "@/lib/utils";
import {
  styleStrengthOptions,
  videoFpsOptions,
  videoResolutionOptions,
  videoShotTypes,
} from "@/lib/video-studio-data";

type VideoAdvancedSettingsProps = {
  selectedModel: ReplicateVideoModelConfig;
  open: boolean;
  onToggleOpen: () => void;
  resolution: string;
  onResolutionChange: (value: string) => void;
  draftMode: boolean;
  onDraftModeChange: (value: boolean) => void;
  saveAudio: boolean;
  onSaveAudioChange: (value: boolean) => void;
  promptUpsampling: boolean;
  onPromptUpsamplingChange: (value: boolean) => void;
  disableSafetyFilter: boolean;
  onDisableSafetyFilterChange: (value: boolean) => void;
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
  selectedModel,
  open,
  onToggleOpen,
  resolution,
  onResolutionChange,
  draftMode,
  onDraftModeChange,
  saveAudio,
  onSaveAudioChange,
  promptUpsampling,
  onPromptUpsamplingChange,
  disableSafetyFilter,
  onDisableSafetyFilterChange,
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
            Only the controls supported by {selectedModel.label} are shown
            here, so the setup stays clear and honest.
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
          {selectedModel.supports.resolutionControl ? (
            <div>
              <label className="mb-3 block text-sm font-medium text-white">
                Resolution
              </label>
              <div className="grid grid-cols-2 gap-3">
                {videoResolutionOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onResolutionChange(item.value)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      resolution === item.value
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {selectedModel.supports.styleStrength ? (
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
          ) : null}

          {selectedModel.supports.motionGuidance ? (
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
          ) : null}

          {selectedModel.supports.shotType ? (
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
          ) : null}

          {selectedModel.supports.fpsControl ? (
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
          ) : null}

          {selectedModel.supports.draftMode ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onDraftModeChange(!draftMode)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  draftMode
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
              >
                <p className="text-sm font-medium">Draft mode</p>
                <p className="mt-1 text-xs leading-5">
                  Faster, lower-cost preview output.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSaveAudioChange(!saveAudio)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  saveAudio
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
              >
                <p className="text-sm font-medium">Save audio</p>
                <p className="mt-1 text-xs leading-5">
                  Keep generated audio with the exported clip.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onPromptUpsamplingChange(!promptUpsampling)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  promptUpsampling
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
              >
                <p className="text-sm font-medium">Prompt upsampling</p>
                <p className="mt-1 text-xs leading-5">
                  Let the model expand your prompt before generation.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onDisableSafetyFilterChange(!disableSafetyFilter)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  disableSafetyFilter
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
              >
                <p className="text-sm font-medium">Safety filter</p>
                <p className="mt-1 text-xs leading-5">
                  {disableSafetyFilter
                    ? "Relaxed for broader generation freedom."
                    : "Standard platform safety checks enabled."}
                </p>
              </button>
            </div>
          ) : null}

          {!selectedModel.supports.resolutionControl &&
          !selectedModel.supports.styleStrength &&
          !selectedModel.supports.motionGuidance &&
          !selectedModel.supports.shotType &&
          !selectedModel.supports.fpsControl &&
          !selectedModel.supports.draftMode ? (
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
              {selectedModel.label} keeps most motion and output settings
              model-managed. Right now, the clearest controls for this model are
              prompt, aspect ratio, duration, and optional source image.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
