"use client";

import { Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type GenerationResultActionsProps = {
  url: string;
  downloadName: string;
  className?: string;
};

export function GenerationResultActions({
  url,
  downloadName,
  className,
}: GenerationResultActionsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#061817]/90 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur",
        className
      )}
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#b7fff5] transition hover:bg-white/10 hover:text-white"
      >
        <ExternalLink className="size-3.5" />
        View
      </a>
      <a
        href={url}
        download={downloadName}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-semibold text-black transition hover:bg-[#d8fff8]"
      >
        <Download className="size-3.5" />
        Download
      </a>
    </div>
  );
}
