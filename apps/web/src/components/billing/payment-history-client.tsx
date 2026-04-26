"use client";

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

export function PaymentHistoryClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch("/api/billing/payments");
        const data = await res.json();
        setPayments(data.payments ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadPayments();
  }, []);

  const totalCreditsBought = useMemo(
    () => payments.reduce((sum, item) => sum + item.credits, 0),
    [payments]
  );

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
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
            Billing
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Payment history
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Review successful credit purchases and payment references.
          </p>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-muted-foreground">Total credits purchased</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {totalCreditsBought} credits
          </p>
        </div>

        <div className="mt-8">
          <BillingQuickLinks />
        </div>

        {payments.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No payments yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Credit pack purchases will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {payments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {payment.packKey || "Credit pack"} · {payment.credits} credits
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {payment.provider} · {payment.reference}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {(payment.amount / 100).toLocaleString()} {payment.currency}
                    </p>
                    <p className="mt-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      {payment.creditedAt ? "Credited" : payment.status}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
