"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AdminUserDetail = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  wallet?: {
    balance: number;
  } | null;
  _count?: {
    assets: number;
    jobs: number;
    payments: number;
    followers: number;
    following: number;
  };
  jobs: {
    id: string;
    type: string;
    status: string;
    prompt?: string | null;
    creditsUsed: number;
    failureReason?: string | null;
    createdAt: string;
  }[];
  payments: {
    id: string;
    reference: string;
    status: string;
    amount: number;
    currency: string;
    credits: number;
    createdAt: string;
  }[];
  creditLedger: {
    id: string;
    type: string;
    amount: number;
    description?: string | null;
    createdAt: string;
  }[];
};

export function AdminUserDetailClient({ userId }: { userId: string }) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load user");
        return;
      }

      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjustCredits() {
    if (!user) return;

    setAdjusting(true);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(adjustAmount),
          reason: adjustReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to adjust credits");
        return;
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              wallet: {
                balance: data.credits,
              },
            }
          : prev
      );

      setAdjustAmount("");
      setAdjustReason("");
      await loadUser();
      alert("Credits adjusted");
    } finally {
      setAdjusting(false);
    }
  }

  useEffect(() => {
    void loadUser();
  }, [userId]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white">User not found</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <Link href="/admin/users" className="text-sm text-primary">
          ← Back to users
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.username || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {(user.displayName || user.username || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Admin user detail
            </div>

            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
              {user.displayName || user.username || user.email || user.id}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {user.email || user.id}
            </p>

            {user.username ? (
              <p className="mt-1 text-sm text-muted-foreground">
                @{user.username}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Credits" value={user.wallet?.balance ?? 0} />
          <Stat label="Assets" value={user._count?.assets ?? 0} />
          <Stat label="Generations" value={user._count?.jobs ?? 0} />
          <Stat label="Payments" value={user._count?.payments ?? 0} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Recent generations">
            {user.jobs.length === 0 ? (
              <Empty />
            ) : (
              user.jobs.map((job) => (
                <Row key={job.id}>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {job.type} · {job.status} · {job.creditsUsed} credits
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {job.prompt || "No prompt"}
                    </p>
                    {job.failureReason ? (
                      <p className="mt-1 text-xs text-red-400">
                        {job.failureReason}
                      </p>
                    ) : null}
                  </div>
                </Row>
              ))
            )}
          </Panel>

          <Panel title="Recent payments">
            {user.payments.length === 0 ? (
              <Empty />
            ) : (
              user.payments.map((payment) => (
                <Row key={payment.id}>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {payment.credits} credits · {payment.status}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(payment.amount / 100).toLocaleString()} {payment.currency}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {payment.reference}
                    </p>
                  </div>
                </Row>
              ))
            )}
          </Panel>

          <Panel title="Recent credit ledger">
            {user.creditLedger.length === 0 ? (
              <Empty />
            ) : (
              user.creditLedger.map((item) => (
                <Row key={item.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.description || item.type}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={
                        item.amount > 0 ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {item.amount > 0 ? "+" : ""}
                      {item.amount}
                    </span>
                  </div>
                </Row>
              ))
            )}
          </Panel>

          <Panel title="Profile">
            <Row>
              <p className="text-sm leading-6 text-muted-foreground">
                {user.bio || "No bio set."}
              </p>
            </Row>

            <Row>
              <p className="text-sm text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleString()}
              </p>
            </Row>
          </Panel>

          <Panel title="Admin credit adjustment">
            <Row>
              <div className="grid gap-3">
                <input
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Amount e.g. 100 or -50"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />

                <input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Reason for adjustment"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={handleAdjustCredits}
                  disabled={adjusting}
                  className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/15 disabled:opacity-60"
                >
                  {adjusting ? "Adjusting..." : "Apply adjustment"}
                </button>
              </div>
            </Row>
          </Panel>
        </div>
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
        {title}
      </h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">No records yet.</p>;
}
