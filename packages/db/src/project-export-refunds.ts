import { db } from "./index";

export async function refundProjectExport(params: {
  userId: string;
  projectId: string;
  exportAttemptId: string;
}) {
  const deduction = await db.creditLedger.findFirst({
    where: {
      userId: params.userId,
      videoProjectId: params.projectId,
      type: "deduction",
      description: {
        contains: params.exportAttemptId
      }
    }
  });

  if (!deduction) {
    return { refunded: false, reason: "NO_DEDUCTION_FOUND" };
  }

  const existingRefund = await db.creditLedger.findFirst({
    where: {
      userId: params.userId,
      videoProjectId: params.projectId,
      type: "project_export_refund",
      description: {
        contains: params.exportAttemptId
      }
    }
  });

  if (existingRefund) {
    return { refunded: false, reason: "ALREADY_REFUNDED" };
  }

  const wallet = await db.creditWallet.findUnique({
    where: { userId: params.userId }
  });

  if (!wallet) {
    throw new Error("WALLET_NOT_FOUND");
  }

  const refundAmount = Math.abs(deduction.amount);
  const description = `Refund for failed project export ${params.exportAttemptId}: ${params.projectId}`;

  await db.$transaction([
    db.creditWallet.update({
      where: { userId: params.userId },
      data: {
        balance: {
          increment: refundAmount
        }
      }
    }),

    db.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount: refundAmount,
        type: "refund",
        description,
        reference: params.projectId
      }
    }),

    db.creditLedger.create({
      data: {
        userId: params.userId,
        videoProjectId: params.projectId,
        type: "project_export_refund",
        amount: refundAmount,
        description
      }
    })
  ]);

  return {
    refunded: true,
    amount: refundAmount
  };
}
