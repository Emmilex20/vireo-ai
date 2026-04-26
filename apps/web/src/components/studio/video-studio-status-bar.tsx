"use client";

import type { ReactNode } from "react";
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  Film,
  Layers3,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

type VideoStudioStatusBarProps = {
  hasPrompt: boolean;
  activeDraftTitle: string | null;
  hasPersistedSession: boolean;
  advancedSettingsOpen: boolean;
  lastAction: string | null;
};

function StatusPill({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
        active
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

export function VideoStudioStatusBar({
  hasPrompt,
  activeDraftTitle,
  hasPersistedSession,
  advancedSettingsOpen,
  lastAction,
}: VideoStudioStatusBarProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-white">
            Video studio status
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Quick visibility into your current cinematic working context.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill
            icon={<CircleDot className="size-3.5" />}
            label={hasPrompt ? "Video prompt ready" : "No prompt yet"}
            active={hasPrompt}
          />

          <StatusPill
            icon={<Save className="size-3.5" />}
            label={
              hasPersistedSession
                ? "Session saved locally"
                : "Session not saved yet"
            }
            active={hasPersistedSession}
          />

          <StatusPill
            icon={<Layers3 className="size-3.5" />}
            label={activeDraftTitle ? `Draft: ${activeDraftTitle}` : "No draft loaded"}
            active={!!activeDraftTitle}
          />

          <StatusPill
            icon={<Film className="size-3.5" />}
            label={
              advancedSettingsOpen
                ? "Advanced settings open"
                : "Advanced settings hidden"
            }
            active={advancedSettingsOpen}
          />
        </div>
      </div>

      <div className="mt-3 rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {lastAction ? (
            <>
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>{lastAction}</span>
            </>
          ) : (
            <>
              <Clock3 className="size-3.5 text-muted-foreground" />
              <span>No recent video studio action yet.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
