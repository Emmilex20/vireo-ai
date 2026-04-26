import { db } from "./index"

export async function grantSubscriptionRenewalCredits(params: {
  userId: string
  subscriptionId?: string | null
  reference: string
  plan: string
  credits: number
  rawPayload?: unknown
}) {
  const existing = await db.subscriptionRenewal.findUnique({
    where: { reference: params.reference },
  })

  if (existing) {
    return {
      granted: false,
      reason: "ALREADY_GRANTED" as const,
    }
  }

  await db.$transaction(async (tx) => {
    const wallet = await tx.creditWallet.upsert({
      where: { userId: params.userId },
      update: {
        balance: {
          increment: params.credits,
        },
      },
      create: {
        userId: params.userId,
        balance: params.credits,
      },
    })

    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        type: "subscription_renewal",
        amount: params.credits,
        description: `Subscription renewal credits: ${params.plan}`,
        reference: params.reference,
      },
    })

    await tx.subscriptionRenewal.create({
      data: {
        userId: params.userId,
        subscriptionId: params.subscriptionId ?? null,
        reference: params.reference,
        plan: params.plan,
        creditsGranted: params.credits,
        rawPayload: params.rawPayload as never,
      },
    })

    await tx.creditLedger.create({
      data: {
        userId: params.userId,
        type: "subscription_renewal",
        amount: params.credits,
        description: `Subscription renewal credits: ${params.plan}`,
      },
    })
  })

  return {
    granted: true,
    credits: params.credits,
  }
}
