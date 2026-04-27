"use client";

import { useEffect, useState } from "react";

type BackgroundMode = "inline" | "workers";

type RuntimeConfig = {
  backgroundMode: BackgroundMode;
};

export function BackgroundModeClient() {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/background-mode");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load background mode");
          return;
        }

        setConfig(data.config);
      } finally {
        setLoading(false);
      }
    }

    void loadConfig();
  }, []);

  async function switchMode(nextMode: BackgroundMode) {
    if (!config || config.backgroundMode === nextMode) {
      return;
    }

    const confirmed = window.confirm(
      nextMode === "workers"
        ? "Switch to worker mode? Queue-based generation and exports will be enabled."
        : "Switch to inline mode? The app will stop relying on workers, and final project export will be disabled."
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/background-mode", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          backgroundMode: nextMode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update background mode");
        return;
      }

      setConfig(data.config);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  if (!config) {
    return (
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold text-white">Background mode</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Unable to load runtime configuration.
          </p>
        </section>
      </main>
    );
  }

  const inlineActive = config.backgroundMode === "inline";

  return (
    <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
          Admin Runtime
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          Background mode
        </h1>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Run generation inline for a low-cost beta, or switch to workers when
          you are ready for the full async setup.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article
            className={`rounded-[1.5rem] border p-5 ${
              inlineActive
                ? "border-primary/30 bg-primary/10"
                : "border-white/10 bg-black/20"
            }`}
          >
            <p className="text-lg font-semibold text-white">Inline beta mode</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Image, video, and scene generation run inside app requests. This
              avoids worker costs, but final project export is disabled.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li>Image generation works</li>
              <li>Video generation works</li>
              <li>Scene generation works</li>
              <li>Final project export is disabled</li>
            </ul>

            <button
              type="button"
              disabled={saving || inlineActive}
              onClick={() => void switchMode("inline")}
              className="mt-5 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary disabled:opacity-50"
            >
              {inlineActive ? "Current mode" : "Switch to inline"}
            </button>
          </article>

          <article
            className={`rounded-[1.5rem] border p-5 ${
              !inlineActive
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-white/10 bg-black/20"
            }`}
          >
            <p className="text-lg font-semibold text-white">Worker mode</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Queue-driven processing for the full product, including final
              project export and better long-running job reliability.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li>Queue-based image and video polling</li>
              <li>Scene worker support</li>
              <li>Final project export enabled</li>
              <li>Requires background workers to be running</li>
            </ul>

            <button
              type="button"
              disabled={saving || !inlineActive}
              onClick={() => void switchMode("workers")}
              className="mt-5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-400 disabled:opacity-50"
            >
              {!inlineActive ? "Current mode" : "Switch to workers"}
            </button>
          </article>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-white">Current status</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            Background mode is currently{" "}
            <span className="font-medium text-white">
              {config.backgroundMode}
            </span>
            . {inlineActive
              ? "Project export is intentionally disabled until workers are available."
              : "Make sure the generation, scene, and export workers are running before users depend on async jobs."}
          </p>
        </div>
      </section>
    </main>
  );
}
