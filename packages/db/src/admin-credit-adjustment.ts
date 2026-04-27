import { db } from "./index";

const TRANSACTION_TIMEOUT_MESSAGE =
  "Transaction API error: Unable to start a transaction in the given time.";

type AdminCreditAdjustmentTransactionClient = Pick<
  typeof db,
  "user" | "creditWallet" | "creditTransaction" | "creditLedger"
>;

export async function adminAdjustUserCredits(params: {
  adminId: string;
  userId: string;
  amount: number;
  reason: string;
}) {
  if (!Number.isInteger(params.amount) || params.amount === 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const reason = params.reason.trim();

  if (!reason) {
    throw new Error("REASON_REQUIRED");
  }

  const runAdjustment = () =>
    db.$transaction(
      async (tx: AdminCreditAdjustmentTransactionClient) => {
        const user = await tx.user.findUnique({
          where: { id: params.userId },
          select: { id: true },
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        const wallet = await tx.creditWallet.findUnique({
          where: { userId: params.userId },
        });

        const currentBalance = wallet?.balance ?? 0;

        if (params.amount < 0 && currentBalance < Math.abs(params.amount)) {
          throw new Error("INSUFFICIENT_USER_CREDITS");
        }

        const updatedWallet = wallet
          ? await tx.creditWallet.update({
              where: { userId: params.userId },
              data: {
                balance: currentBalance + params.amount,
              },
            })
          : await tx.creditWallet.create({
              data: {
                userId: params.userId,
                balance: params.amount,
              },
            });

        await tx.creditTransaction.create({
          data: {
            walletId: updatedWallet.id,
            userId: params.userId,
            amount: params.amount,
            type: "admin_adjustment",
            description: `Admin adjustment by ${params.adminId}: ${reason}`,
          },
        });

        await tx.creditLedger.create({
          data: {
            userId: params.userId,
            type: "admin_adjustment",
            amount: params.amount,
            description: `Admin adjustment: ${reason}`,
            adminId: params.adminId,
          },
        });

        return updatedWallet;
      },
      {
        maxWait: 10_000,
        timeout: 15_000,
      }
    );

  try {
    return await runAdjustment();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(TRANSACTION_TIMEOUT_MESSAGE)
    ) {
      try {
        return await runAdjustment();
      } catch (retryError) {
        if (
          retryError instanceof Error &&
          retryError.message.includes(TRANSACTION_TIMEOUT_MESSAGE)
        ) {
          throw new Error("TRANSACTION_TIMEOUT");
        }

        throw retryError;
      }
    }

    throw error;
  }
}
