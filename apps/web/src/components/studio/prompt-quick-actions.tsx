"use client";

type PromptQuickActionsProps = {
  onReplace: () => void;
  onAppend: () => void;
  disabled?: boolean;
};

export function PromptQuickActions({
  onReplace,
  onAppend,
  disabled = false,
}: PromptQuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onReplace}
        disabled={disabled}
        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Replace prompt
      </button>

      <button
        type="button"
        onClick={onAppend}
        disabled={disabled}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Append to prompt
      </button>
    </div>
  );
}
