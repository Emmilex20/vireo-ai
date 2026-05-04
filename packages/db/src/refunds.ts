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

  const reservation = await db.creditLedger.findFirst({
    where: {
      generationJobId: job.id,
      type: "reservation",
    },
  })

  const capture = await db.creditLedger.findFirst({
    where: {
      generationJobId: job.id,
      type: "capture",
    },
  })

  const deduction = await db.creditLedger.findFirst({
    where: {
      generationJobId: job.id,
      type: "deduction",
    },
  })

  if (!reservation && !deduction) {
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

  if (reservation && !capture) {
    const refundReference = `generation:${job.id}:refund`

    const result = await db.$transaction(async (tx) => {
      const existingRefund = await tx.creditLedger.findUnique({
        where: { operationKey: refundReference },
      })

      if (existingRefund) {
        await tx.generationJob.update({
          where: { id: job.id },
          data: {
            refundedAt: new Date(),
          },
        })

        return { refunded: false, reason: "ALREADY_REFUNDED" as const }
      }

      const updated = await tx.creditWallet.updateMany({
        where: {
          userId: job.userId,
          reservedBalance: {
            gte: job.creditsUsed,
          },
        },
        data: {
          balance: {
            increment: job.creditsUsed,
          },
          reservedBalance: {
            decrement: job.creditsUsed,
          },
        },
      })

      if (updated.count !== 1) {
        await tx.generationJob.update({
          where: { id: job.id },
          data: {
            refundedAt: new Date(),
          },
        })

        return { refunded: false, reason: "NO_RESERVED_CREDITS_FOUND" as const }
      }

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          userId: job.userId,
          amount: job.creditsUsed,
          type: "refund",
          description: `Refund reserved credits for failed ${job.type} generation`,
          reference: refundReference,
        },
      })

      await tx.creditLedger.create({
        data: {
          userId: job.userId,
          generationJobId: job.id,
          type: "refund",
          amount: job.creditsUsed,
          description: `Refund reserved credits for failed ${job.type} generation`,
          reference: job.id,
          operationKey: refundReference,
        },
      })

      await tx.generationJob.update({
        where: { id: job.id },
        data: {
          refundedAt: new Date(),
        },
      })

      return {
        refunded: true,
        amount: job.creditsUsed,
      }
    })

    return result
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
