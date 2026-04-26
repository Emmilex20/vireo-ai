export const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter",
    priceNGN: 5000,
    credits: 200,
    paystackPlanCode: process.env.PAYSTACK_PLAN_STARTER!
  },
  creator: {
    name: "Creator",
    priceNGN: 15000,
    credits: 800,
    paystackPlanCode: process.env.PAYSTACK_PLAN_CREATOR!
  },
  pro: {
    name: "Pro",
    priceNGN: 30000,
    credits: 2000,
    paystackPlanCode: process.env.PAYSTACK_PLAN_PRO!
  }
} as const;
