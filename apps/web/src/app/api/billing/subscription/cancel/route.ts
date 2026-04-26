import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@vireon/db";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const reason = body.reason || "No reason provided";
  const note = body.note || null;

  const subscription = await db.subscription.findFirst({
    where: {
      userId,
      status: "active"
    }
  });

  if (!subscription) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  if (!subscription.paystackSubscriptionCode || !subscription.paystackEmailToken) {
    return NextResponse.json(
      { error: "Subscription cannot be cancelled automatically yet." },
      { status: 400 }
    );
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY is not set" },
      { status: 500 }
    );
  }

  const res = await fetch("https://api.paystack.co/subscription/disable", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code: subscription.paystackSubscriptionCode,
      token: subscription.paystackEmailToken
    })
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    return NextResponse.json(
      { error: data.message || "Failed to cancel Paystack subscription" },
      { status: 400 }
    );
  }

  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "cancel_pending"
    }
  });

  await (db as typeof db & {
    subscriptionCancelFeedback: {
      create: (args: {
        data: {
          userId: string;
          subscriptionId: string;
          reason: string;
          note: string | null;
        };
      }) => Promise<unknown>;
    };
  }).subscriptionCancelFeedback.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      reason,
      note
    }
  });

  return NextResponse.json({
    success: true,
    message: "Subscription cancellation requested successfully."
  });
}
