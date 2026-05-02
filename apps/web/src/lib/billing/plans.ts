export const FALLBACK_NGN_PER_USD = 1000;
export const EXCHANGE_RATE_PROVIDER_URL = "https://www.exchangerate-api.com";
export const EXCHANGE_RATE_OPEN_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

export const SUBSCRIPTION_PLANS = {
  essential: {
    name: "Essential",
    priceUSD: 14,
    annualPriceUSD: 7,
    credits: 4000,
  },
  advanced: {
    name: "Advanced",
    priceUSD: 29,
    annualPriceUSD: 14.5,
    credits: 12000,
  },
  infinite: {
    name: "Infinite",
    priceUSD: 56,
    annualPriceUSD: 28,
    credits: 24000,
  }
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionBillingCycle = "monthly" | "annual";

export function getSubscriptionBillingMonths(cycle: SubscriptionBillingCycle) {
  return cycle === "annual" ? 12 : 1;
}

export function getSubscriptionPriceUSD(
  planKey: SubscriptionPlanKey,
  cycle: SubscriptionBillingCycle
) {
  const plan = SUBSCRIPTION_PLANS[planKey];
  const monthlyUsd = cycle === "annual" ? plan.annualPriceUSD : plan.priceUSD;

  return monthlyUsd * getSubscriptionBillingMonths(cycle);
}

export function getSubscriptionAmountKobo(
  planKey: SubscriptionPlanKey,
  cycle: SubscriptionBillingCycle,
  ngnPerUsd = FALLBACK_NGN_PER_USD
) {
  return Math.round(
    getSubscriptionPriceUSD(planKey, cycle) * ngnPerUsd * 100
  );
}

export function getSubscriptionCreditsForCycle(
  planKey: SubscriptionPlanKey,
  cycle: SubscriptionBillingCycle
) {
  return SUBSCRIPTION_PLANS[planKey].credits * getSubscriptionBillingMonths(cycle);
}

export function getNextSubscriptionPeriodEnd(cycle: SubscriptionBillingCycle) {
  const date = new Date();
  date.setMonth(date.getMonth() + getSubscriptionBillingMonths(cycle));
  return date;
}
