"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ProviderStatus = {
  key: string;
  name: string;
  required: string[];
  ready: boolean;
  missing: string[];
};

export function ProviderSettingsClient() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await fetch("/api/admin/providers/status");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load provider status");
          return;
        }

        setProviders(data.providers ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadProviders();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Admin Providers
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            AI provider readiness
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Check whether real AI provider environment variables are configured
            before switching from mock generation.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {providers.map((provider) => (
            <article
              key={provider.key}
              className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {provider.name}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Required env vars: {provider.required.join(", ")}
                  </p>

                  {provider.missing.length > 0 ? (
                    <p className="mt-2 text-sm text-red-400">
                      Missing: {provider.missing.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-emerald-400">
                      All required variables are configured.
                    </p>
                  )}
                </div>

                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                    provider.ready
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/20 bg-red-500/10 text-red-400"
                  }`}
                >
                  {provider.ready ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  {provider.ready ? "Ready" : "Not ready"}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
