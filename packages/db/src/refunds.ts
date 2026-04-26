import { db } from "./index"

export async function refundFailedGenerationJob(jobId: string) {
  const job = await db.generationJob.findUnique({
    where: { id: jobId },
  })

  if (!job) {
    throw new Error("JOB_NOT_FOUND")
  }

  if (job.status !== "failed") {
    throw new Error("JOB_NOT_FAILED")
  }

  if (job.refundedAt) {
    return { refunded: false, reason: "ALREADY_REFUNDED" }
  }

  const deduction = await db.creditLedger.findFirst({
    where: {
      generationJobId: job.id,
      type: "deduction",
    },
  })

  if (!deduction) {
    await db.generationJob.update({
      where: { id: job.id },
      data: {
        refundedAt: new Date(),
      },
    })

    return {
      refunded: false,
      reason: "NO_DEDUCTION_FOUND",
    }
  }

  const wallet = await db.creditWallet.findUnique({
    where: { userId: job.userId },
  })

  if (!wallet) {
    throw new Error("WALLET_NOT_FOUND")
  }

  await db.$transaction([
    db.creditWallet.update({
      where: { userId: job.userId },
      data: {
        balance: {
          increment: job.creditsUsed,
        },
      },
    }),

    db.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: job.userId,
        amount: job.creditsUsed,
        type: "refund",
        description: `Refund for failed ${job.type} generation`,
        reference: job.id,
      },
    }),

    db.creditLedger.create({
      data: {
        userId: job.userId,
        generationJobId: job.id,
        type: "refund",
        amount: job.creditsUsed,
        description: `Refund for failed ${job.type} generation`,
      },
    }),

    db.generationJob.update({
      where: { id: job.id },
      data: {
        refundedAt: new Date(),
      },
    }),
  ])

  return {
    refunded: true,
    amount: job.creditsUsed,
  }
}
