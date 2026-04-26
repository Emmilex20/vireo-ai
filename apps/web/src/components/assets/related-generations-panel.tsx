"use client";

import { useEffect, useState } from "react";

type RelatedGeneration = {
  id: string;
  type: string;
  status: string;
  prompt?: string | null;
  outputUrl?: string | null;
  createdAt: string;
};

export function RelatedGenerationsPanel({ assetId }: { assetId: string }) {
  const [generations, setGenerations] = useState<RelatedGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelated() {
      try {
        const res = await fetch(`/api/assets/${assetId}/related`);
        const data = await res.json();
        setGenerations(data.generations ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadRelated();
  }, [assetId]);

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
        Loading related generations...
      </div>
    );
  }

  if (generations.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Related generations
        </h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
          {generations.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {generations.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3"
          >
            <p className="text-xs font-medium text-white">
              {item.type} · {item.status}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {item.prompt || "No prompt stored"}
            </p>

            {item.outputUrl ? (
              <video
                src={item.outputUrl}
                controls
                className="mt-3 max-h-40 w-full rounded-[1rem] object-cover"
              />
            ) : null}

            <p className="mt-2 text-[11px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
