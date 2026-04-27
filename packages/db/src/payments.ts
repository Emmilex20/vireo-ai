import { db } from "./index"

type PaymentCreditTransactionClient = Pick<
  typeof db,
  "creditWallet" | "payment" | "creditTransaction" | "creditLedger"
>

export async function grantCreditsForPayment(params: {
  userId: string
  reference: string
  provider: string
  amount: number
  currency: string
  packKey?: string
  credits: number
  rawPayload?: unknown
}) {
  const existing = await db.payment.findUnique({
    where: { reference: params.reference },
  })

  if (existing?.creditedAt) {
    return { credited: false, reason: "ALREADY_CREDITED" }
  }

  return db.$transaction(async (tx: PaymentCreditTransactionClient) => {
    const wallet = await tx.creditWallet.upsert({
      where: { userId: params.userId },
      update: {},
      create: {
        userId: params.userId,
        balance: 0,
      },
    })

    const payment = await tx.payment.upsert({
      where: { reference: params.reference },
      update: {
        status: "success",
        amount: params.amount,
        currency: params.currency,
        packKey: params.packKey,
        credits: params.credits,
        rawPayload: params.rawPayload as never,
        creditedAt: existing?.creditedAt ?? new Date(),
      },
      create: {
        userId: params.userId,
        reference: params.reference,
        provider: params.provider,
        status: "success",
        amount: params.amount,
        currency: params.currency,
        packKey: params.packKey,
        credits: params.credits,
        rawPayload: params.rawPayload as never,
        creditedAt: new Date(),
      },
    })

    if (!existing?.creditedAt) {
      await tx.creditWallet.update({
        where: { userId: params.userId },
        data: {
          balance: {
            increment: params.credits,
          },
        },
      })

      await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          userId: params.userId,
          amount: params.credits,
          type: "purchase",
          description: `Credit purchase: ${params.packKey ?? "pack"}`,
          reference: params.reference,
        },
      })

      await tx.creditLedger.create({
        data: {
          userId: params.userId,
          type: "purchase",
          amount: params.credits,
          description: `Credit purchase: ${params.packKey ?? "pack"}`,
        },
      })
    }

    return { credited: !existing?.creditedAt, payment }
  })
}
