"use client";

import Link from "next/link";
import { Coins, CreditCard, History, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BillingQuickLinks } from "@/components/billing/billing-quick-links";

type Payment = {
  id: string;
  reference: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  packKey?: string | null;
  credits: number;
  creditedAt?: string | null;
  createdAt: string;
};

type LedgerItem = {
  id: string;
  type: string;
  amount: number;
  description?: string | null;
  createdAt: string;
};

export function BillingOverviewClient() {
  const [credits, setCredits] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBilling() {
      try {
        const [balanceRes, paymentsRes, ledgerRes] = await Promise.all([
          fetch("/api/credits/balance"),
          fetch("/api/billing/payments"),
          fetch("/api/credits/ledger"),
        ]);

        const balanceData = await balanceRes.json();
        const paymentsData = await paymentsRes.json();
        const ledgerData = await ledgerRes.json();

        setCredits(balanceData.credits ?? 0);
        setPayments(paymentsData.payments ?? []);
        setLedger(ledgerData.ledger ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadBilling();
  }, []);

  const totalPurchased = useMemo(
    () => payments.reduce((sum, item) => sum + item.credits, 0),
    [payments]
  );

  const totalSpent = useMemo(
    () =>
      ledger
        .filter((item) => item.amount < 0)
        .reduce((sum, item) => sum + Math.abs(item.amount), 0),
    [ledger]
  );

  const recentPayments = payments.slice(0, 3);
  const recentLedger = ledger.slice(0, 5);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-36 rounded-[1.5rem] bg-white/5" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Billing Overview
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
              Credits, payments, and usage
            </h1>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Manage your credit balance and review your purchase and usage activity.
            </p>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15"
          >
            <Plus className="size-4" />
            Buy credits
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<Coins className="size-5 text-primary" />}
            label="Current balance"
            value={`${credits} credits`}
          />
          <StatCard
            icon={<CreditCard className="size-5 text-primary" />}
            label="Credits purchased"
            value={`${totalPurchased} credits`}
          />
          <StatCard
            icon={<History className="size-5 text-primary" />}
            label="Credits spent"
            value={`${totalSpent} credits`}
          />
        </div>

        <div className="mt-8">
          <BillingQuickLinks />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                Recent payments
              </h2>
              <Link href="/billing/payments" className="text-sm text-primary">
                View all
              </Link>
            </div>

            {recentPayments.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                No payments yet.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {payment.packKey || "Credit pack"} · {payment.credits} credits
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(payment.amount / 100).toLocaleString()} {payment.currency} ·{" "}
                      {payment.creditedAt ? "Credited" : payment.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                Recent credit activity
              </h2>
              <Link href="/billing/credits" className="text-sm text-primary">
                View all
              </Link>
            </div>

            {recentLedger.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                No credit activity yet.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {recentLedger.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.description || item.type}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${
                        item.amount > 0
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-red-500/20 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {item.amount > 0 ? "+" : ""}
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
