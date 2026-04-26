import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createPaymentAuditLog, grantCreditsForPayment } from "@vireon/db";
import { getCreditPackByKey } from "@/lib/billing/credit-packs";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not set" },
        { status: 500 }
      );
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status) {
      await createPaymentAuditLog({
        reference,
        provider: "paystack",
        eventType: "manual_verify",
        status: "error",
        reason: verifyData.message || "Failed to verify payment",
        rawPayload: verifyData,
      });

      return NextResponse.json(
        { error: verifyData.message || "Failed to verify payment" },
        { status: 400 }
      );
    }

    const data = verifyData.data;
    const metadata = data.metadata ?? {};

    if (data.status !== "success") {
      return NextResponse.json({
        success: false,
        status: data.status,
      });
    }

    if (metadata.userId !== userId) {
      return NextResponse.json(
        { error: "Payment does not belong to this user" },
        { status: 403 }
      );
    }

    if (metadata.productType !== "credit_pack") {
      return NextResponse.json(
        { error: "Unsupported payment product" },
        { status: 400 }
      );
    }

    const pack = getCreditPackByKey(metadata.packKey);

    if (!pack) {
      await createPaymentAuditLog({
        reference: data.reference,
        provider: "paystack",
        eventType: "manual_verify",
        status: "rejected",
        reason: "Invalid credit pack metadata",
        rawPayload: verifyData,
      });

      return NextResponse.json(
        { error: "Invalid credit pack metadata" },
        { status: 400 }
      );
    }

    if (
      Number(metadata.credits) !== pack.credits ||
      Number(data.amount) !== pack.amountKobo ||
      data.currency !== pack.currency
    ) {
      await createPaymentAuditLog({
        reference: data.reference,
        provider: "paystack",
        eventType: "manual_verify",
        status: "rejected",
        reason: "Payment metadata mismatch",
        rawPayload: verifyData,
      });

      return NextResponse.json(
        { error: "Payment metadata does not match selected credit pack" },
        { status: 400 }
      );
    }

    const result = await grantCreditsForPayment({
      userId,
      reference: data.reference,
      provider: "paystack",
      amount: pack.amountKobo,
      currency: pack.currency,
      packKey: pack.key,
      credits: pack.credits,
      rawPayload: verifyData,
    });

    await createPaymentAuditLog({
      reference: data.reference,
      provider: "paystack",
      eventType: "manual_verify",
      status: "accepted",
      reason: "Credit pack payment accepted",
      rawPayload: verifyData,
    });

    return NextResponse.json({
      success: true,
      credited: result.credited,
    });
  } catch {
    await createPaymentAuditLog({
      provider: "paystack",
      eventType: "manual_verify",
      status: "error",
      reason: "Payment verification failed",
    });

    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
