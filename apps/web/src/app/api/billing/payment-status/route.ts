import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPaymentByReference } from "@vireon/db";

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

  return NextResponse.json({
    found: Boolean(payment),
    status: payment?.status ?? "pending",
    creditedAt: payment?.creditedAt ?? null,
    credits: payment?.credits ?? 0,
  });
}
