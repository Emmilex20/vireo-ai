"use client";

import { Trash2 } from "lucide-react";

type VideoDraft = {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  updatedAt: string;
};

type VideoDraftsPanelProps = {
  drafts: VideoDraft[];
  activeDraftId: string | null;
  deletingDraftId: string | null;
  onLoadDraft: (draft: VideoDraft) => void;
  onDeleteDraft: (draftId: string) => void;
};

export function VideoDraftsPanel({
  drafts,
  activeDraftId,
  deletingDraftId,
  onLoadDraft,
  onDeleteDraft,
}: VideoDraftsPanelProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
          Saved video drafts
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Reload your cinematic setup instantly.
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-black/20 p-6 text-center">
          <p className="text-sm font-medium text-white">No video drafts yet</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Save your current video setup to reuse it later.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {drafts.map((draft) => {
            const isActive = activeDraftId === draft.id;
            const isDeleting = deletingDraftId === draft.id;

            return (
              <div
                key={draft.id}
                className={`rounded-[1.25rem] border p-4 transition ${
                  isActive
                    ? "border-primary/25 bg-primary/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onLoadDraft(draft)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-white">
                      {draft.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {draft.prompt}
                    </p>
                  </button>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteDraft(draft.id)}
                      disabled={isDeleting}
                      aria-label={`Delete ${draft.title}`}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {draft.duration ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {draft.duration}s
                    </span>
                  ) : null}
                  {draft.aspectRatio ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {draft.aspectRatio}
                    </span>
                  ) : null}
                  {draft.motionIntensity ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {draft.motionIntensity}
                    </span>
                  ) : null}
                  {draft.cameraMove ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {draft.cameraMove}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
