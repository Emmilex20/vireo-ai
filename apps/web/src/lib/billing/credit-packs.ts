export const CREDIT_PACKS = [
  {
    key: "starter",
    name: "Starter Pack",
    credits: 100,
    amountKobo: 500000,
    currency: "NGN",
    priceLabel: "₦5,000",
    description: "Good for testing image generations and a few video drafts.",
  },
  {
    key: "creator",
    name: "Creator Pack",
    credits: 500,
    amountKobo: 2000000,
    currency: "NGN",
    priceLabel: "₦20,000",
    description: "Best for active creators making images and short videos.",
    popular: true,
  },
  {
    key: "studio",
    name: "Studio Pack",
    credits: 1500,
    amountKobo: 5000000,
    currency: "NGN",
    priceLabel: "₦50,000",
    description: "For serious production, content teams, and heavy workflows.",
  },
];

export const GENERATION_COSTS = {
  image: 5,
  video: 40,
};

export function getCreditPackByKey(key: string) {
  return CREDIT_PACKS.find((pack) => pack.key === key);
}
