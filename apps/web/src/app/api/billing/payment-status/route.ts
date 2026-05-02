import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, getPaymentByReference } from "@vireon/db";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required" },
      { status: 400 }
    );
  }

  const payment = await getPaymentByReference({ userId, reference });
  const subscriptionRenewal = payment
    ? null
    : await db.subscriptionRenewal.findUnique({
        where: { reference },
      });

  return NextResponse.json({
    found: Boolean(payment || subscriptionRenewal),
    status: payment?.status ?? (subscriptionRenewal ? "success" : "pending"),
    creditedAt: payment?.creditedAt ?? subscriptionRenewal?.createdAt ?? null,
    credits: payment?.credits ?? subscriptionRenewal?.creditsGranted ?? 0,
  });
}
