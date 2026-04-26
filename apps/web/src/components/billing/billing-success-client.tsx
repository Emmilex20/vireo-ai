"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BillingStatus =
  | "checking"
  | "credited"
  | "pending"
  | "failed"
  | "missing_reference";

export function BillingSuccessClient({ reference }: { reference?: string }) {
  const [status, setStatus] = useState<BillingStatus>("checking");
  const [message, setMessage] = useState("");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (!reference) {
      setStatus("missing_reference");
      return;
    }

    let attempts = 0;
    let cancelled = false;
    let timeoutId: number | null = null;

    async function checkStatus() {
      if (cancelled) return;

      attempts += 1;

      const res = await fetch(`/api/billing/payment-status?reference=${reference}`);
      const data = await res.json();

      if (cancelled) return;

      if (data.status === "failed") {
        setStatus("failed");
        setMessage("Payment failed or was cancelled.");
        return;
      }

      if (data.creditedAt) {
        setStatus("credited");
        setCredits(data.credits ?? 0);
        window.dispatchEvent(new Event("vireon:credits-updated"));
        return;
      }

      if (attempts === 4) {
        const verifyRes = await fetch("/api/billing/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          setMessage(verifyData.error || "Verification fallback failed.");
        }

        if (verifyData.success === false) {
          setStatus("failed");
          setMessage(`Payment status: ${verifyData.status}`);
          return;
        }
      }

      if (attempts >= 10) {
        setStatus("pending");
        return;
      }

      timeoutId = window.setTimeout(checkStatus, 3000);
    }

    void checkStatus();

    return () => {
      cancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [reference]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[800px] items-center justify-center px-4 py-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
          Billing
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          {status === "credited"
            ? "Credits added successfully"
            : status === "pending"
              ? "Payment still verifying"
              : status === "failed"
                ? "Payment not completed"
              : status === "missing_reference"
                ? "Missing payment reference"
                : "Checking payment status"}
        </h1>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {status === "credited"
            ? `${credits} credits have been added to your account.`
            : status === "pending"
              ? message ||
                "Your payment may still be processing. Check your credit history shortly."
              : status === "failed"
                ? message ||
                  "The payment was not completed. You can try again from the pricing page."
              : status === "missing_reference"
                ? "We could not find the payment reference in the URL."
                : "Please wait while we confirm your payment."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15"
          >
            Buy credits
          </Link>

          <Link
            href="/billing/credits"
            className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15"
          >
            View credit history
          </Link>

          <Link
            href="/studio"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Back to studio
          </Link>
        </div>
      </section>
    </main>
  );
}
