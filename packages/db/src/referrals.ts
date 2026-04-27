import { db } from "./index"

const REFERRAL_REWARD_CREDITS = 20

type ReferralRewardTransactionClient = Pick<
  typeof db,
  "creditLedger" | "creditWallet" | "creditTransaction"
>

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function ensureReferralCode(userId: string) {
  const existing = await db.user.findUnique({
    where: { id: userId },
  })

  if (existing?.referralCode) return existing.referralCode

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateCode()

    const collision = await db.user.findFirst({
      where: { referralCode: code },
      select: { id: true },
    })

    if (collision) {
      continue
    }

    await db.user.update({
      where: { id: userId },
      data: { referralCode: code },
    })

    return code
  }

  throw new Error("FAILED_TO_GENERATE_REFERRAL_CODE")
}

export async function rewardReferral(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { referredBy: true },
  })

  if (!user?.referredBy) return

  const assetCount = await db.asset.count({
    where: { userId },
  })

  if (assetCount !== 1) return

  const rewardDescription = `referral_reward_${userId}`

  const alreadyRewarded = await db.creditLedger.findFirst({
    where: {
      userId: user.referredBy.id,
      description: rewardDescription,
    },
  })

  if (alreadyRewarded) return

  await db.$transaction(async (tx: ReferralRewardTransactionClient) => {
    const duplicate = await tx.creditLedger.findFirst({
      where: {
        userId: user.referredBy!.id,
        description: rewardDescription,
      },
    })

    if (duplicate) return

    const wallet = await tx.creditWallet.upsert({
      where: { userId: user.referredBy!.id },
      update: {
        balance: {
          increment: REFERRAL_REWARD_CREDITS,
        },
      },
      create: {
        userId: user.referredBy!.id,
        balance: REFERRAL_REWARD_CREDITS,
      },
    })

    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: user.referredBy!.id,
        type: "referral_reward",
        amount: REFERRAL_REWARD_CREDITS,
        description: rewardDescription,
        reference: `referral:${userId}`,
      },
    })

    await tx.creditLedger.create({
      data: {
        userId: user.referredBy!.id,
        type: "referral_reward",
        amount: REFERRAL_REWARD_CREDITS,
        description: rewardDescription,
      },
    })
  })
}
