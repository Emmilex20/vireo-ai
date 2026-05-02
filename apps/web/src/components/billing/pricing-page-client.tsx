"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Coins,
} from "lucide-react";
import {
  EXCHANGE_RATE_PROVIDER_URL,
  FALLBACK_NGN_PER_USD,
  SUBSCRIPTION_PLANS,
} from "@/lib/billing/plans";

type BillingCycle = "monthly" | "annual";
type PaidPlanKey = keyof typeof SUBSCRIPTION_PLANS;

type PricingPlan = {
  key: "free" | PaidPlanKey;
  name: string;
  monthlyPrice: number;
  annualPrice?: number;
  credits: number;
  accent: string;
  description: string;
  popular?: boolean;
  features: string[];
};

const LEGACY_PLAN_MAP: Record<string, PaidPlanKey> = {
  starter: "essential",
  creator: "advanced",
  pro: "infinite",
};

const PAID_PLAN_KEYS = Object.keys(SUBSCRIPTION_PLANS) as PaidPlanKey[];

const plans: PricingPlan[] = [
  {
    key: "free",
    name: "Free",
    monthlyPrice: 0,
    credits: 40,
    accent: "bg-slate-500",
    description: "Explore OpenArt-style creation basics.",
    features: [
      "40 one-time trial credits for 7 days",
      "4 parallel generations",
      "Use trial credits to test premium features",
      "Join Discord for extra creator credits",
      "All creations are private",
    ],
  },
  {
    key: "essential",
    name: "Essential",
    monthlyPrice: 14,
    annualPrice: 7,
    credits: SUBSCRIPTION_PLANS.essential.credits,
    accent: "bg-slate-400",
    description: "Start experimenting with the magic of AI creation.",
    features: [
      "4,000 credits every month",
      "Up to 4,000 images",
      "Up to 30 videos",
      "Up to 3 consistent characters",
      "Up to 5 one-click stories",
      "13 personalized models",
      "8 parallel generations",
      "Access to premium image, video, and audio models",
      "One-click story creation",
      "Powerful image editing suite",
    ],
  },
  {
    key: "advanced",
    name: "Advanced",
    monthlyPrice: 29,
    annualPrice: 14.5,
    credits: SUBSCRIPTION_PLANS.advanced.credits,
    accent: "bg-cyan-300",
    description: "Unlock deeper control and create at scale.",
    features: [
      "12,000 credits every month",
      "Add credits as needed",
      "Up to 12,000 images",
      "Up to 150 videos",
      "Up to 10 consistent characters",
      "Up to 17 one-click stories",
      "40 personalized models",
      "16 parallel generations",
      "Access to premium image, video, and audio models",
      "One-click story creation",
      "Powerful image editing suite",
      "Commercial use rights",
    ],
  },
  {
    key: "infinite",
    name: "Infinite",
    monthlyPrice: 56,
    annualPrice: 28,
    credits: SUBSCRIPTION_PLANS.infinite.credits,
    accent: "bg-fuchsia-500",
    description: "Create at full speed with uninterrupted flow.",
    popular: true,
    features: [
      "24,000 credits every month",
      "Add credits as needed",
      "Up to 24,000 images",
      "Up to 300 videos",
      "Up to 40 consistent characters",
      "Up to 34 one-click stories",
      "80 personalized models",
      "32 parallel generations",
      "Access to premium image, video, and audio models",
      "One-click story creation",
      "Powerful image editing suite",
      "Commercial use rights",
      "Priority support",
    ],
  },
];

export function PricingPageClient() {
  const router = useRouter();
  const { user } = useUser();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [subscriptionLoading, setSubscriptionLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const normalizedCurrentPlan = useMemo(() => {
    if (!currentPlan) return null;
    return LEGACY_PLAN_MAP[currentPlan] ?? (currentPlan as PaidPlanKey);
  }, [currentPlan]);

  useEffect(() => {
    void fetch("/api/billing/subscription")
      .then((res) => res.json())
      .then((data) => {
        setCurrentPlan(data.subscription?.plan || null);
      })
      .catch(() => {
        setCurrentPlan(null);
      });
  }, []);

  async function subscribe(planKey: PaidPlanKey) {
    setSubscriptionLoading(planKey);

    try {
      const email =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress;

      if (!email) {
        alert("Please sign in before subscribing.");
        return;
      }

      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planKey,
          email,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start subscription");
        return;
      }

      if (data.authorizationUrl) {
        router.push(data.authorizationUrl);
        return;
      }

      alert("Failed to start subscription");
    } catch {
      alert("Something went wrong");
    } finally {
      setSubscriptionLoading(null);
    }
  }

  function getButtonLabel(planKey: PricingPlan["key"]) {
    if (planKey === "free") return "Get Started";
    if (normalizedCurrentPlan === planKey) return "Current plan";
    if (normalizedCurrentPlan) return "Switch plan";
    return "Get Started";
  }

  async function handlePlanClick(planKey: PricingPlan["key"]) {
    if (planKey === "free") {
      router.push("/studio");
      return;
    }

    if (normalizedCurrentPlan === planKey) return;

    if (normalizedCurrentPlan) {
      const confirmed = window.confirm(
        "To switch plans, your current subscription will be cancelled and replaced. Continue?"
      );

      if (!confirmed) return;

      setSubscriptionLoading(planKey);

      try {
        const cancelRes = await fetch("/api/billing/subscription/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "switch_plan",
            note: `User initiated switch from ${normalizedCurrentPlan} to ${planKey}`,
          }),
        });

        const cancelData = await cancelRes.json();

        if (!cancelRes.ok) {
          alert(cancelData.error || "Failed to cancel current plan");
          return;
        }

        setCurrentPlan(null);
        alert("Current plan cancelled. Proceeding to new plan...");
      } finally {
        setSubscriptionLoading(null);
      }
    }

    await subscribe(planKey);
  }

  return (
    <main className="min-h-screen bg-[#111417] px-3 py-4 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-360 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#171a1d] shadow-[0_28px_100px_rgba(0,0,0,0.34)]">
        <div className="relative border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_78%_0%,rgba(217,70,239,0.12),transparent_34%)]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Coins className="size-3.5" />
                Creator plans
              </div>
              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">
                Choose the credit flow that fits your studio.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Every plan includes private creation, premium model access, and a monthly credit allowance for image, video, and story workflows.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Checkout is processed by Paystack in NGN using the latest available USD to NGN rate. If live rates are unavailable, we fall back to ₦{FALLBACK_NGN_PER_USD.toLocaleString()} per $1. Annual plans charge 12 months upfront. Rates by{" "}
                <a
                  href={EXCHANGE_RATE_PROVIDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 underline-offset-4 hover:text-white hover:underline"
                >
                  ExchangeRate-API
                </a>
                .
              </p>
            </div>

            <div className="flex w-fit rounded-full border border-white/10 bg-black/25 p-1">
              <CycleButton
                label="Monthly"
                active={billingCycle === "monthly"}
                onClick={() => setBillingCycle("monthly")}
              />
              <CycleButton
                label="Annually"
                badge="50% Off"
                active={billingCycle === "annual"}
                onClick={() => setBillingCycle("annual")}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid gap-4 xl:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                billingCycle={billingCycle}
                buttonLabel={getButtonLabel(plan.key)}
                loading={subscriptionLoading === plan.key}
                disabled={normalizedCurrentPlan === plan.key}
                onSelect={() => void handlePlanClick(plan.key)}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded-[1.35rem] border border-primary/35 bg-[#0d1114] p-5 shadow-[inset_3px_0_0_rgba(45,212,191,0.95)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Optional add-on
                  </p>
                  <h2 className="mt-4 text-xl font-black text-white">
                    Extra Credit <span className="text-primary">$15</span>
                    <span className="text-sm font-medium text-slate-400"> /month</span>
                  </h2>
                </div>
                <Link href="/billing" className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">
                  Learn more
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr]">
                <div className="inline-flex h-10 w-fit items-center justify-center rounded-full bg-primary px-4 text-sm font-black text-black">
                  1x
                </div>
                <div className="flex h-10 items-center justify-between rounded-full bg-black/35 px-4 text-sm text-white">
                  <span>5,000 credits / month</span>
                  <ChevronDown className="size-4 text-slate-500" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handlePlanClick("advanced")}
                className="mt-4 h-11 w-full rounded-xl bg-white text-sm font-bold text-black transition hover:bg-slate-200"
              >
                Subscribe to Advanced to Unlock
              </button>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <Feature text="Flexible usage" compact />
                <Feature text="10% off credit packs with wonder plans" compact />
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-white/10 bg-[#0d1114] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                For teams & organizations
              </p>
              <h2 className="mt-4 text-xl font-black text-white">
                Team and Enterprise Plans
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Vireon AI creates the tools teams need to move faster: shared credits, collaborative workspaces, 100+ model integrations, and custom onboarding.
              </p>
              <Link
                href="mailto:support@vireon.ai?subject=Vireon%20Team%20Plan"
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black transition hover:bg-slate-200"
              >
                Explore Team and Enterprise plans
                <ArrowRight className="size-4" />
              </Link>
            </section>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setShowCompare((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Compare all features
              <ChevronDown className={`size-4 transition ${showCompare ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showCompare ? (
            <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 p-4 md:grid-cols-3">
              {PAID_PLAN_KEYS.map((key) => {
                const plan = SUBSCRIPTION_PLANS[key];
                return (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="font-bold text-white">{plan.name}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {plan.credits.toLocaleString()} monthly credits.
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function PlanCard({
  plan,
  billingCycle,
  buttonLabel,
  loading,
  disabled,
  onSelect,
}: {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  buttonLabel: string;
  loading: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const price =
    billingCycle === "annual" && plan.annualPrice !== undefined
      ? plan.annualPrice
      : plan.monthlyPrice;
  const isFree = plan.key === "free";

  return (
    <article
      className={`relative flex min-h-152 flex-col overflow-hidden rounded-[1.15rem] border p-5 ${
        plan.popular
          ? "border-fuchsia-400/25 bg-[linear-gradient(180deg,rgba(134,24,93,0.72),rgba(77,22,62,0.9))]"
          : "border-white/10 bg-[#15191c]"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${plan.accent}`} />
      {plan.popular ? (
        <div className="absolute right-5 top-5 rounded-sm bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-black">
          Most popular
        </div>
      ) : null}

      <p className="text-sm font-bold text-white">{plan.name}</p>

      <div className="mt-5 flex items-end gap-1">
        <span className="text-4xl font-black text-white">${formatPrice(price)}</span>
        {!isFree ? <span className="pb-1 text-xs text-slate-500">/seat/mo</span> : null}
      </div>

      {billingCycle === "annual" && plan.monthlyPrice > price ? (
        <p className="mt-1 text-xs text-slate-500">
          <span className="line-through">${formatPrice(plan.monthlyPrice)}</span> billed annually
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSelect}
        disabled={disabled || loading}
        className="mt-5 h-10 rounded-md bg-white text-xs font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Starting..." : buttonLabel}
      </button>

      <p className="mt-3 min-h-10 text-xs leading-5 text-slate-500">
        {plan.description}
      </p>

      <div className="mt-5 rounded-lg border border-primary/10 bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
        {plan.credits.toLocaleString()} {isFree ? "one-time trial credits for 7 days" : "credits / month"}
      </div>

      <div className="mt-5 grid gap-3 text-xs text-slate-300">
        {plan.features.map((feature) => (
          <Feature key={feature} text={feature} />
        ))}
      </div>
    </article>
  );
}

function CycleButton({
  label,
  badge,
  active,
  onClick,
}: {
  label: string;
  badge?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full px-4 text-xs font-bold transition ${
        active ? "bg-white text-black" : "text-slate-400 hover:bg-white/7 hover:text-white"
      }`}
    >
      {label}
      {badge ? <span className="ml-1 text-[10px] text-fuchsia-500">{badge}</span> : null}
    </button>
  );
}

function Feature({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={`flex items-start gap-2 ${compact ? "" : "pr-2"}`}>
      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <span>{text}</span>
      {!compact ? <CircleHelp className="ml-auto size-3.5 shrink-0 text-slate-600" /> : null}
    </div>
  );
}

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
