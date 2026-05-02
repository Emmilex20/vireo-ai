import {
  EXCHANGE_RATE_OPEN_ENDPOINT,
  FALLBACK_NGN_PER_USD,
} from "@/lib/billing/plans";

type ExchangeRateResponse = {
  result?: string;
  rates?: {
    NGN?: number;
  };
};

export type ResolvedExchangeRate = {
  rate: number;
  source: "live" | "fallback";
};

export async function getUsdToNgnRate(): Promise<ResolvedExchangeRate> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(EXCHANGE_RATE_OPEN_ENDPOINT, {
      signal: controller.signal,
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!res.ok) {
      return { rate: FALLBACK_NGN_PER_USD, source: "fallback" };
    }

    const data = (await res.json()) as ExchangeRateResponse;
    const rate = data.rates?.NGN;

    if (data.result !== "success" || !rate || !Number.isFinite(rate)) {
      return { rate: FALLBACK_NGN_PER_USD, source: "fallback" };
    }

    return { rate, source: "live" };
  } catch {
    return { rate: FALLBACK_NGN_PER_USD, source: "fallback" };
  } finally {
    clearTimeout(timeout);
  }
}
