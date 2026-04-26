import { db } from "./index";

export async function refundSceneGeneration(params: {
  userId: string;
  sceneId: string;
  kind: "image" | "video";
  amount: number;
}) {
  const deduction = await db.creditLedger.findFirst({
    where: {
      userId: params.userId,
      sceneId: params.sceneId,
      type: "deduction",
      description: {
        contains: `Scene ${params.kind}`
      }
    }
  });

  if (!deduction) {
    return { refunded: false, reason: "NO_DEDUCTION_FOUND" };
  }

  const existingRefund = await db.creditLedger.findFirst({
    where: {
      userId: params.userId,
      sceneId: params.sceneId,
      type: "scene_refund",
      description: {
        contains: `failed scene ${params.kind}`
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

  const refundAmount = Math.abs(deduction.amount || -params.amount);
  const description = `Refund for failed scene ${params.kind}: ${params.sceneId}`;

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
        reference: params.sceneId
      }
    }),

    db.creditLedger.create({
      data: {
        userId: params.userId,
        sceneId: params.sceneId,
        type: "scene_refund",
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
