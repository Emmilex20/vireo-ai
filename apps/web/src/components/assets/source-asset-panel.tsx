"use client";

import { useEffect, useState } from "react";

type SourceAsset = {
  id: string;
  title?: string | null;
  prompt?: string | null;
  fileUrl: string;
  createdAt: string;
};

export function SourceAssetPanel({
  sourceAssetId,
  onOpenSource
}: {
  sourceAssetId: string;
  onOpenSource?: (asset: SourceAsset) => void;
}) {
  const [asset, setAsset] = useState<SourceAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSource() {
      try {
        const res = await fetch(`/api/assets/source/${sourceAssetId}`);
        const data = await res.json();

        if (res.ok) {
          setAsset(data.asset);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadSource();
  }, [sourceAssetId]);

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
        Loading source image...
      </div>
    );
  }

  if (!asset) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
      <div className="flex items-start gap-4">
        <div className="h-24 w-28 overflow-hidden rounded-[1rem] border border-white/10 bg-black/30">
          <img
            src={asset.fileUrl}
            alt={asset.title || "Source image"}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Source image</p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {asset.prompt || "No prompt stored"}
          </p>

          <button
            type="button"
            onClick={() => onOpenSource?.(asset)}
            className="mt-3 rounded-full border border-primary/20 bg-black/20 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"
          >
            Open source image
          </button>
        </div>
      </div>
    </div>
  );
}
