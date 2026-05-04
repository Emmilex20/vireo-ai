import { CreditTransactionType } from "@vireon/types"

import { db } from "./index"

export async function getUserWallet(userId: string) {
  return db.creditWallet.findUnique({
    where: { userId },
  })
}

export async function ensureUserWallet(userId: string, startingBalance = 50) {
  const wallet = await db.creditWallet.findUnique({
    where: { userId },
  })

  if (wallet) return wallet

  return db.creditWallet.create({
    data: {
      userId,
      balance: startingBalance,
    },
  })
}

export async function addCredits(params: {
  userId: string
  amount: number
  type: CreditTransactionType
  description?: string
}) {
  const wallet = await db.creditWallet.findUnique({
    where: { userId: params.userId },
  })

  if (!wallet) throw new Error("Wallet not found")

  return db.$transaction([
    db.creditWallet.update({
      where: { userId: params.userId },
      data: {
        balance: {
          increment: params.amount,
        },
      },
    }),

    db.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount: params.amount,
        type: params.type,
        description: params.description,
      },
    }),
  ])
}

export async function deductCredits(params: {
  userId: string
  amount: number
  description?: string
  generationJobId?: string
  sceneId?: string
  videoProjectId?: string
}) {
  const wallet = await db.creditWallet.findUnique({
    where: { userId: params.userId },
  })

  if (!wallet) throw new Error("Wallet not found")

  if (wallet.balance < params.amount) {
    throw new Error("INSUFFICIENT_CREDITS")
  }

  return db.$transaction([
    db.creditWallet.update({
      where: { userId: params.userId },
      data: {
        balance: {
          decrement: params.amount,
        },
      },
    }),

    db.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount: -params.amount,
        type: "generation_debit",
        description: params.description,
      },
    }),

    db.creditLedger.create({
      data: {
        userId: params.userId,
        generationJobId: params.generationJobId ?? null,
        sceneId: params.sceneId ?? null,
        videoProjectId: params.videoProjectId ?? null,
        type: "deduction",
        amount: -params.amount,
        description: params.description ?? "Credit deduction",
      },
    }),
  ])
}

export async function deductCreditsForGenerationJobs(params: {
  userId: string
  jobs: {
    generationJobId: string
    amount: number
    description?: string
  }[]
  description?: string
}) {
  if (params.jobs.length === 0) {
    throw new Error("NO_GENERATION_JOBS")
  }

  const totalAmount = params.jobs.reduce((total, job) => total + job.amount, 0)

  return db.$transaction(async (tx) => {
    const wallet = await tx.creditWallet.findUnique({
      where: { userId: params.userId },
    })

    if (!wallet) throw new Error("Wallet not found")

    if (wallet.balance < totalAmount) {
      throw new Error("INSUFFICIENT_CREDITS")
    }

    const updatedWallet = await tx.creditWallet.update({
      where: { userId: params.userId },
      data: {
        balance: {
          decrement: totalAmount,
        },
      },
    })

    const transaction = await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount: -totalAmount,
        type: "generation_debit",
        description: params.description,
      },
    })

    const ledgerEntries = await Promise.all(
      params.jobs.map((job) =>
        tx.creditLedger.create({
          data: {
            userId: params.userId,
            generationJobId: job.generationJobId,
            type: "deduction",
            amount: -job.amount,
            description:
              job.description ?? params.description ?? "Credit deduction",
          },
        })
      )
    )

    return [updatedWallet, transaction, ...ledgerEntries] as const
  })
}
