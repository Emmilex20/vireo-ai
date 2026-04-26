import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCreditPackByKey } from "@/lib/billing/credit-packs";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const body = await req.json();

    const pack = getCreditPackByKey(body.packKey);

    if (!pack) {
      return NextResponse.json(
        { error: "Invalid credit pack" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not set" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reference = `vireon_${userId}_${pack.key}_${Date.now()}`;

    const email =
      user?.emailAddresses?.[0]?.emailAddress || `${userId}@vireon.local`;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: pack.amountKobo,
        currency: pack.currency,
        reference,
        callback_url: `${appUrl}/billing/success?reference=${reference}`,
        metadata: {
          userId,
          packKey: pack.key,
          credits: pack.credits,
          amountKobo: pack.amountKobo,
          currency: pack.currency,
          productType: "credit_pack",
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
