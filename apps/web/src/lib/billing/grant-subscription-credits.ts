import { db } from "@vireon/db";

type SubscriptionCreditTransactionClient = Pick<
  typeof db,
  "creditWallet" | "creditTransaction" | "creditLedger" | "subscription"
>;

function getNextPeriodEnd(currentPeriodEnd: Date, now: Date) {
  const nextPeriodEnd = new Date(currentPeriodEnd);

  while (nextPeriodEnd <= now) {
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
  }

  return nextPeriodEnd;
}

export async function grantSubscriptionCredits() {
  const subs = await db.subscription.findMany({
    where: {
      status: "active"
    }
  });

  for (const sub of subs) {
    const now = new Date();

    if (sub.currentPeriodEnd <= now) {
      const nextPeriodEnd = getNextPeriodEnd(sub.currentPeriodEnd, now);

      await db.$transaction(async (tx: SubscriptionCreditTransactionClient) => {
        const wallet = await tx.creditWallet.upsert({
          where: { userId: sub.userId },
          update: {
            balance: {
              increment: sub.creditsPerMonth
            }
          },
          create: {
            userId: sub.userId,
            balance: sub.creditsPerMonth
          }
        });

        await tx.creditTransaction.create({
          data: {
            walletId: wallet.id,
            userId: sub.userId,
            amount: sub.creditsPerMonth,
            type: "subscription_credit",
            description: `${sub.plan} monthly subscription credits`
          }
        });

        await tx.creditLedger.create({
          data: {
            userId: sub.userId,
            type: "subscription_credit",
            amount: sub.creditsPerMonth,
            description: `${sub.plan} monthly subscription credits`
          }
        });

        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            currentPeriodEnd: nextPeriodEnd
          }
        });
      });
    }
  }
}
