import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@vireon/db";
import { SUBSCRIPTION_PLANS } from "@/lib/billing/plans";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planKey, email } = await req.json();
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["active", "cancel_pending"]
        }
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        {
          error:
            "You already have an active subscription. Cancel it before switching plans."
        },
        { status: 400 }
      );
    }

    const plan =
      SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!plan.paystackPlanCode) {
      return NextResponse.json(
        { error: "Paystack plan code is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not set" },
        { status: 500 }
      );
    }

    const user = await currentUser();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resolvedEmail =
      email ||
      user?.emailAddresses?.[0]?.emailAddress ||
      `${userId}@vireon.local`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: resolvedEmail,
          plan: plan.paystackPlanCode,
          callback_url: `${appUrl}/billing`,
          metadata: {
            userId,
            planKey
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize subscription checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to start subscription checkout" },
      { status: 500 }
    );
  }
}
