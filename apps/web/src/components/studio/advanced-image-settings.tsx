"use client";

import { cn } from "@/lib/utils";

type QualityMode = "standard" | "high" | "ultra";

type AdvancedImageSettingsProps = {
  open: boolean;
  onToggleOpen: () => void;
  supportsSeed: boolean;
  supportsSteps: boolean;
  supportsGuidance: boolean;
  qualityMode: QualityMode;
  onQualityModeChange: (value: QualityMode) => void;
  promptBoost: boolean;
  onPromptBoostChange: (value: boolean) => void;
  seed: string;
  onSeedChange: (value: string) => void;
  steps: number;
  onStepsChange: (value: number) => void;
  guidance: number;
  onGuidanceChange: (value: number) => void;
};

const qualityModes: Array<{
  value: QualityMode;
  label: string;
  description: string;
}> = [
  {
    value: "standard",
    label: "Standard",
    description: "Balanced speed and quality",
  },
  {
    value: "high",
    label: "High",
    description: "Sharper detail and stronger adherence",
  },
  {
    value: "ultra",
    label: "Ultra",
    description: "Heavier quality mode for premium outputs",
  },
];

export function AdvancedImageSettings({
  open,
  onToggleOpen,
  supportsSeed,
  supportsSteps,
  supportsGuidance,
  qualityMode,
  onQualityModeChange,
  promptBoost,
  onPromptBoostChange,
  seed,
  onSeedChange,
  steps,
  onStepsChange,
  guidance,
  onGuidanceChange,
}: AdvancedImageSettingsProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
            Advanced settings
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Fine-tune image generation behavior for more control.
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
              Quality mode
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              {qualityModes.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => onQualityModeChange(mode.value)}
                  className={cn(
                    "rounded-[1.25rem] border p-4 text-left transition",
                    qualityMode === mode.value
                      ? "border-primary/25 bg-primary/10"
                      : "border-white/10 bg-black/20 hover:bg-white/5"
                  )}
                >
                  <div className="text-sm font-medium text-white">
                    {mode.label}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">
                    {mode.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <div>
              <p className="text-sm font-medium text-white">Prompt boost</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enrich the prompt automatically for stronger scene detail.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onPromptBoostChange(!promptBoost)}
              className={cn(
                "relative h-7 w-12 rounded-full transition",
                promptBoost ? "bg-primary" : "bg-white/15"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-5 rounded-full bg-white transition",
                  promptBoost ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>

          {supportsSeed || supportsSteps || supportsGuidance ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {supportsSeed ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Seed
                    </label>
                    <input
                      value={seed}
                      onChange={(e) => onSeedChange(e.target.value)}
                      placeholder="Optional fixed seed"
                      inputMode="numeric"
                      className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Use a fixed seed when you want more reproducible generations.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4 text-xs leading-5 text-muted-foreground">
                    This model does not support a fixed seed. It decides image
                    randomness internally.
                  </div>
                )}

                {supportsSteps ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Steps: {steps}
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={1}
                      value={steps}
                      onChange={(e) => onStepsChange(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Higher steps can improve detail, but usually increase generation
                      time.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4 text-xs leading-5 text-muted-foreground">
                    This model uses its own built-in step schedule and does not
                    expose a manual steps control.
                  </div>
                )}
              </div>

              {supportsGuidance ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Guidance: {guidance.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={guidance}
                    onChange={(e) => onGuidanceChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Higher guidance pushes the model to follow the prompt more
                    aggressively.
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
              This model uses a more opinionated generation pipeline, so seed,
              steps, and guidance are handled automatically for you.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
