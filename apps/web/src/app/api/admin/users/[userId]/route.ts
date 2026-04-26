import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminAdjustUserCredits, getAdminUserDetail } from "@vireon/db";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: adminId } = await auth();

  if (!adminId || !ADMIN_USER_IDS.includes(adminId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const user = await getAdminUserDetail(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminId } = await auth();

    if (!adminId || !ADMIN_USER_IDS.includes(adminId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await req.json();

    const updatedWallet = await adminAdjustUserCredits({
      adminId,
      userId,
      amount: Number(body.amount),
      reason: body.reason ?? "",
    });

    return NextResponse.json({
      success: true,
      credits: updatedWallet.balance,
    });
  } catch (error: any) {
    const messages: Record<string, string> = {
      INVALID_AMOUNT: "Amount must be a non-zero integer.",
      REASON_REQUIRED: "Reason is required.",
      USER_NOT_FOUND: "User not found.",
      INSUFFICIENT_USER_CREDITS: "User does not have enough credits to remove.",
      TRANSACTION_TIMEOUT:
        "Credit adjustment timed out while starting the database transaction. Please try again.",
    };

    return NextResponse.json(
      {
        error:
          messages[error.message] ||
          (error instanceof Error
            ? `Failed to adjust credits: ${error.message}`
            : "Failed to adjust credits"),
      },
      { status: 400 }
    );
  }
}
