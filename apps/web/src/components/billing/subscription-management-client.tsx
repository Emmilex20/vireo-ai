"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Subscription = {
  id: string;
  plan: string;
  status: string;
  creditsPerMonth: number;
  currentPeriodEnd: string;
};

type Renewal = {
  id: string;
  reference: string;
  plan: string;
  creditsGranted: number;
  createdAt: string;
};

export function SubscriptionManagementClient() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch("/api/billing/subscription");
        const data = await res.json();
        setSubscription(data.subscription ?? null);
        setRenewals(data.renewals ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadSubscription();
  }, []);

  async function cancelSubscription() {
    setCancelling(true);

    try {
      const res = await fetch("/api/billing/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reason: cancelReason,
          note: cancelNote
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to cancel subscription");
        return;
      }

      alert(data.message || "Subscription cancellation requested.");
      setSubscription((prev) =>
        prev ? { ...prev, status: "cancel_pending" } : prev
      );
      setShowCancelForm(false);
      setCancelReason("");
      setCancelNote("");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
          Subscription
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          Manage subscription
        </h1>

        {!subscription ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-lg font-semibold text-white">
              No active subscription
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe to receive monthly credits automatically.
            </p>

            <Link
              href="/pricing"
              className="mt-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary hover:bg-primary/15"
            >
              View plans
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="mt-2 text-2xl font-bold capitalize text-white">
                {subscription.plan}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Stat label="Status" value={subscription.status} />
                <Stat
                  label="Monthly credits"
                  value={`${subscription.creditsPerMonth}`}
                />
                <Stat
                  label="Renews/ends"
                  value={new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString()}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary hover:bg-primary/15"
                >
                  Change plan
                </Link>

                {subscription.status === "active" ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelForm(true)}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2 text-sm text-red-400"
                  >
                    Cancel subscription
                  </button>
                ) : null}
              </div>

              {subscription.status === "cancel_pending" ? (
                <p className="mt-3 text-xs text-amber-400">
                  Your subscription will remain active until the end of the
                  current billing period.
                </p>
              ) : null}

              {showCancelForm ? (
                <div className="mt-5 rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm font-semibold text-white">
                    Before you cancel, tell us why
                  </p>

                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mt-3 w-full rounded-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                  >
                    <option value="">Select a reason</option>
                    <option value="too_expensive">Too expensive</option>
                    <option value="not_enough_credits">Not enough credits</option>
                    <option value="not_using_enough">Not using it enough</option>
                    <option value="quality_issue">
                      Generation quality issue
                    </option>
                    <option value="technical_issue">Technical issue</option>
                    <option value="other">Other</option>
                  </select>

                  <textarea
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    placeholder="Optional note..."
                    rows={3}
                    className="mt-3 min-h-24 w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                  />

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={cancelSubscription}
                      disabled={cancelling || !cancelReason}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2 text-sm text-red-400 disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling..." : "Confirm cancellation"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCancelForm(false)}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white"
                    >
                      Keep subscription
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {renewals.length > 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <h2 className="text-lg font-semibold text-white">
                  Renewal history
                </h2>

                <div className="mt-4 grid gap-3">
                  {renewals.map((renewal) => (
                    <article
                      key={renewal.id}
                      className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-sm font-medium text-white">
                        {renewal.plan} · +{renewal.creditsGranted} credits
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {renewal.reference}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(renewal.createdAt).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
