"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Check, Coins, Sparkles, Video } from "lucide-react";
import { BillingQuickLinks } from "@/components/billing/billing-quick-links";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, GENERATION_COSTS } from "@/lib/billing/credit-packs";
import { SUBSCRIPTION_PLANS } from "@/lib/billing/plans";

export function PricingPageClient() {
  const { user } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

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

  async function handleBuy(packKey: string) {
    setCheckoutLoading(packKey);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start checkout");
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch {
      alert("Something went wrong");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function subscribe(planKey: string) {
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
          email
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start subscription");
        return;
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      alert("Failed to start subscription");
    } catch {
      alert("Something went wrong");
    } finally {
      setSubscriptionLoading(null);
    }
  }

  function getButtonState(planKey: string) {
    if (!currentPlan) {
      return {
        label: "Subscribe",
        disabled: false
      };
    }

    if (currentPlan === planKey) {
      return {
        label: "Current plan",
        disabled: true
      };
    }

    return {
      label: "Switch plan",
      disabled: false
    };
  }

  async function handlePlanClick(planKey: string) {
    if (!currentPlan) {
      return subscribe(planKey);
    }

    if (currentPlan === planKey) return;

    const confirmed = window.confirm(
      "To switch plans, your current subscription will be cancelled and replaced. Continue?"
    );

    if (!confirmed) return;

    setSubscriptionLoading(planKey);

    try {
      const cancelRes = await fetch("/api/billing/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reason: "switch_plan",
          note: `User initiated switch from ${currentPlan} to ${planKey}`
        })
      });

      const cancelData = await cancelRes.json();

      if (!cancelRes.ok) {
        alert(cancelData.error || "Failed to cancel current plan");
        return;
      }

      setCurrentPlan(null);
      alert("Current plan cancelled. Proceeding to new plan...");

      await subscribe(planKey);
    } finally {
      setSubscriptionLoading(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Coins className="size-3.5" />
            Vireon Credits
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-white">
            Buy credits for image and video generation
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Credits power your AI generations. Start small, scale as your creative
            workflow grows.
          </p>
        </div>

        <div className="mt-8">
          <BillingQuickLinks />
        </div>

        <div className="mt-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="size-3.5" />
              Monthly subscriptions
            </div>

            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
              Predictable monthly credits for creators who publish often
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Subscriptions give you a recurring monthly credit drop, while one-time
              credit packs stay available whenever you need extra room.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
              const state = getButtonState(key);

              return (
                <article
                  key={key}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                >
                  <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-white">
                    {plan.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    N{plan.priceNGN.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.credits} credits/month
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-300">
                    <Feature
                      text={`${Math.floor(plan.credits / GENERATION_COSTS.image)} image generations/month`}
                    />
                    <Feature
                      text={`${Math.floor(plan.credits / GENERATION_COSTS.video)} video generations/month`}
                    />
                    <Feature text="Monthly recurring credits for steady usage" />
                  </div>

                  <button
                    type="button"
                    disabled={state.disabled || subscriptionLoading === key}
                    onClick={() => handlePlanClick(key)}
                    className="mt-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {subscriptionLoading === key ? "Starting..." : state.label}
                  </button>
                </article>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Switching plans will cancel your current subscription and start a
            new one immediately.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <article
              key={pack.key}
              className={`relative rounded-[1.75rem] border p-6 ${
                pack.popular
                  ? "border-primary/30 bg-primary/10"
                  : "border-white/10 bg-black/20"
              }`}
            >
              {pack.popular ? (
                <div className="absolute right-5 top-5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                  Popular
                </div>
              ) : null}

              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                {pack.name}
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {pack.description}
              </p>

              <div className="mt-6">
                <p className="text-4xl font-bold text-white">{pack.priceLabel}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pack.credits} credits
                </p>
              </div>

              <Button
                onClick={() => handleBuy(pack.key)}
                disabled={checkoutLoading === pack.key}
                className="mt-6 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {checkoutLoading === pack.key ? "Redirecting..." : `Buy ${pack.name}`}
              </Button>

              <div className="mt-6 grid gap-3 text-sm text-slate-300">
                <Feature
                  text={`${Math.floor(pack.credits / GENERATION_COSTS.image)} image generations`}
                />
                <Feature
                  text={`${Math.floor(pack.credits / GENERATION_COSTS.video)} video generations`}
                />
                <Feature text="Credits never tied to one media type" />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary" />
              <p className="font-semibold text-white">Image generation</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {GENERATION_COSTS.image} credits per generated image.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <Video className="size-5 text-primary" />
              <p className="font-semibold text-white">Video generation</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {GENERATION_COSTS.video} credits per generated video.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="size-4 text-primary" />
      <span>{text}</span>
    </div>
  );
}
