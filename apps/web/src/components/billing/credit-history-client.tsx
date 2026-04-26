"use client";

import { useEffect, useMemo, useState } from "react";
import { BillingQuickLinks } from "@/components/billing/billing-quick-links";

type LedgerItem = {
  id: string;
  type: string;
  amount: number;
  description?: string | null;
  createdAt: string;
  generationJob?: {
    id: string;
    type: string;
    prompt?: string | null;
    status: string;
  } | null;
};

export function CreditHistoryClient() {
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLedger() {
      try {
        const res = await fetch("/api/credits/ledger");
        const data = await res.json();
        setLedger(data.ledger ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadLedger();
  }, []);

  const totalDeductions = useMemo(
    () =>
      ledger
        .filter((item) => item.amount < 0)
        .reduce((sum, item) => sum + Math.abs(item.amount), 0),
    [ledger]
  );

  const totalRefunds = useMemo(
    () =>
      ledger
        .filter((item) => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0),
    [ledger]
  );

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-[1.5rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Credits
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Credit history
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Review your deductions, refunds, and generation-related credit movement.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-muted-foreground">Total spent</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {totalDeductions} credits
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-muted-foreground">Total refunded</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {totalRefunds} credits
            </p>
          </div>
        </div>

        <div className="mt-8">
          <BillingQuickLinks />
        </div>

        {ledger.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No credit activity yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Generation deductions and refunds will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {ledger.map((item) => {
              const positive = item.amount > 0;

              return (
                <article
                  key={item.id}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.description || item.type}
                      </p>

                      {item.generationJob ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {item.generationJob.type} · {item.generationJob.status} ·{" "}
                          {item.generationJob.prompt || "No prompt"}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          General credit movement
                        </p>
                      )}

                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                        positive
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-red-500/20 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {item.amount} credits
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
