"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Subscription = {
  id: string;
  plan: string;
  status: string;
  creditsPerMonth: number;
  currentPeriodEnd: string;
  createdAt: string;
  paystackSubscriptionCode?: string | null;
  user?: {
    id: string;
    email?: string | null;
    username?: string | null;
    displayName?: string | null;
  } | null;
};

type Stats = {
  active: number;
  cancelPending: number;
  cancelled: number;
  renewals: number;
};

export function AdminSubscriptionsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const res = await fetch("/api/admin/subscriptions");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load subscriptions");
          return;
        }

        setStats(data.stats);
        setSubscriptions(data.subscriptions ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadSubscriptions();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return subscriptions;

    return subscriptions.filter((sub) => {
      return (
        sub.plan.toLowerCase().includes(term) ||
        sub.status.toLowerCase().includes(term) ||
        sub.paystackSubscriptionCode?.toLowerCase().includes(term) ||
        sub.user?.id.toLowerCase().includes(term) ||
        sub.user?.email?.toLowerCase().includes(term) ||
        sub.user?.username?.toLowerCase().includes(term) ||
        sub.user?.displayName?.toLowerCase().includes(term)
      );
    });
  }, [subscriptions, query]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Admin
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Subscriptions
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor subscribers, renewals, cancellations, and recurring credit
            grants.
          </p>
        </div>

        {stats ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Active" value={stats.active} />
            <Stat label="Cancel pending" value={stats.cancelPending} />
            <Stat label="Cancelled" value={stats.cancelled} />
            <Stat label="Renewals" value={stats.renewals} />
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plan, status, user, or Paystack code..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">
              No subscriptions found
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr_1fr] gap-3 border-b border-white/10 bg-black/30 px-4 py-3 text-xs font-medium text-muted-foreground">
                  <span>User</span>
                  <span>Plan</span>
                  <span>Status</span>
                  <span>Credits</span>
                  <span>Period end</span>
                  <span>Paystack</span>
                </div>

                {filtered.map((sub) => (
                  <div
                    key={sub.id}
                    className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr_1fr] gap-3 border-b border-white/10 px-4 py-4 text-xs text-slate-300 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-white">
                        {sub.user?.displayName ||
                          sub.user?.username ||
                          sub.user?.email ||
                          sub.user?.id ||
                          "Unknown"}
                      </p>
                      <p className="mt-1 truncate text-muted-foreground">
                        {sub.user?.email || sub.user?.id}
                      </p>
                    </div>

                    <span className="capitalize">{sub.plan}</span>

                    <span
                      className={
                        sub.status === "active"
                          ? "text-emerald-400"
                          : sub.status === "cancel_pending"
                            ? "text-amber-400"
                            : "text-red-400"
                      }
                    >
                      {sub.status}
                    </span>

                    <span>{sub.creditsPerMonth}</span>

                    <span>
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </span>

                    <span className="truncate">
                      {sub.paystackSubscriptionCode || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
