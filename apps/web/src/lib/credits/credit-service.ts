import { db } from "@vireon/db";

type CreditMetadata = Record<string, unknown> | undefined;

export class InsufficientCreditsError extends Error {
  constructor(
    public requiredCredits: number,
    public availableCredits: number
  ) {
    super("INSUFFICIENT_CREDITS");
  }
}

export async function getUserCreditBalance(userId: string) {
  const wallet = await db.creditWallet.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      balance: 0,
    },
  });

  return {
    availableCredits: wallet.balance,
    reservedCredits: wallet.reservedBalance,
    totalCredits: wallet.balance + wallet.reservedBalance,
  };
}

export async function reserveCredits(params: {
  userId: string;
  amount: number;
  generationId: string;
  reason: string;
  metadata?: CreditMetadata;
}) {
  const amount = normalizeAmount(params.amount);
  const operationKey = `generation:${params.generationId}:reserve`;

  return db.$transaction(async (tx) => {
    const existing = await tx.creditLedger.findUnique({
      where: { operationKey },
    });

    if (existing) {
      const wallet = await tx.creditWallet.findUniqueOrThrow({
        where: { userId: params.userId },
      });
      return { wallet, ledger: existing, idempotent: true };
    }

    await tx.creditWallet.upsert({
      where: { userId: params.userId },
      update: {},
      create: {
        userId: params.userId,
        balance: 0,
      },
    });

    const updated = await tx.creditWallet.updateMany({
      where: {
        userId: params.userId,
        balance: {
          gte: amount,
        },
      },
      data: {
        balance: {
          decrement: amount,
        },
        reservedBalance: {
          increment: amount,
        },
      },
    });

    if (updated.count !== 1) {
      const wallet = await tx.creditWallet.findUniqueOrThrow({
        where: { userId: params.userId },
      });
      throw new InsufficientCreditsError(amount, wallet.balance);
    }

    const wallet = await tx.creditWallet.findUniqueOrThrow({
      where: { userId: params.userId },
    });

    const ledger = await tx.creditLedger.create({
      data: {
        userId: params.userId,
        generationJobId: params.generationId,
        type: "reservation",
        amount: -amount,
        description: params.reason,
        reference: params.generationId,
        operationKey,
        metadata: params.metadata as never,
      },
    });

    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount: -amount,
        type: "generation_reserve",
        description: params.reason,
        reference: operationKey,
      },
    });

    console.info("[credits] reserved", {
      userId: params.userId,
      generationId: params.generationId,
      amount,
    });

    return { wallet, ledger, idempotent: false };
  });
}

export async function captureReservedCredits(params: {
  userId: string;
  amount: number;
  generationId: string;
  reason: string;
}) {
  const amount = normalizeAmount(params.amount);
  const operationKey = `generation:${params.generationId}:capture`;

  return db.$transaction(async (tx) => {
    const existing = await tx.creditLedger.findUnique({
      where: { operationKey },
    });

    if (existing) {
      const wallet = await tx.creditWallet.findUniqueOrThrow({
        where: { userId: params.userId },
      });
      return { wallet, ledger: existing, idempotent: true };
    }

    const reservation = await tx.creditLedger.findUnique({
      where: { operationKey: `generation:${params.generationId}:reserve` },
    });

    if (!reservation) {
      const wallet = await tx.creditWallet.findUniqueOrThrow({
        where: { userId: params.userId },
      });
      return { wallet, ledger: null, idempotent: true };
    }

    const updated = await tx.creditWallet.updateMany({
      where: {
        userId: params.userId,
        reservedBalance: {
          gte: amount,
        },
      },
      data: {
        reservedBalance: {
          decrement: amount,
        },
      },
    });

    if (updated.count !== 1) {
      throw new Error("RESERVED_CREDITS_NOT_FOUND");
    }

    const wallet = await tx.creditWallet.findUniqueOrThrow({
      where: { userId: params.userId },
    });

    const ledger = await tx.creditLedger.create({
      data: {
        userId: params.userId,
        generationJobId: params.generationId,
        type: "capture",
        amount: -amount,
        description: params.reason,
        reference: params.generationId,
        operationKey,
      },
    });

    console.info("[credits] captured", {
      userId: params.userId,
      generationId: params.generationId,
      amount,
    });

    return { wallet, ledger, idempotent: false };
  });
}

export async function refundReservedCredits(params: {
  userId: string;
  amount: number;
  generationId: string;
  reason: string;
}) {
  const amount = normalizeAmount(params.amount);
  const operationKey = `generation:${params.generationId}:refund`;

  return db.$transaction(async (tx) => {
    const existing = await tx.creditLedger.findUnique({
      where: { operationKey },
    });

    if (existing) {
      const wallet = await tx.creditWallet.findUniqueOrThrow({
        where: { userId: params.userId },
      });
      return { wallet, ledger: existing, idempotent: true };
    }

    const updated = await tx.creditWallet.updateMany({
      where: {
        userId: params.userId,
        reservedBalance: {
          gte: amount,
        },
      },
      data: {
        balance: {
          increment: amount,
        },
        reservedBalance: {
          decrement: amount,
        },
      },
    });

    if (updated.count !== 1) {
      const wallet = await tx.creditWallet.findUniqueOrThrow({
        where: { userId: params.userId },
      });
      return { wallet, ledger: null, idempotent: true };
    }

    const wallet = await tx.creditWallet.findUniqueOrThrow({
      where: { userId: params.userId },
    });

    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount,
        type: "refund",
        description: params.reason,
        reference: operationKey,
      },
    });

    const ledger = await tx.creditLedger.create({
      data: {
        userId: params.userId,
        generationJobId: params.generationId,
        type: "refund",
        amount,
        description: params.reason,
        reference: params.generationId,
        operationKey,
      },
    });

    console.info("[credits] refunded", {
      userId: params.userId,
      generationId: params.generationId,
      amount,
    });

    return { wallet, ledger, idempotent: false };
  });
}

export async function addPurchasedCredits(params: {
  userId: string;
  amount: number;
  paymentReference: string;
  metadata?: CreditMetadata;
}) {
  const amount = normalizeAmount(params.amount);
  const operationKey = `payment:${params.paymentReference}:credit`;

  return db.$transaction(async (tx) => {
    const existing = await tx.creditLedger.findUnique({
      where: { operationKey },
    });

    if (existing) {
      const wallet = await tx.creditWallet.findUniqueOrThrow({
        where: { userId: params.userId },
      });
      return { wallet, ledger: existing, idempotent: true };
    }

    const wallet = await tx.creditWallet.upsert({
      where: { userId: params.userId },
      update: {
        balance: {
          increment: amount,
        },
      },
      create: {
        userId: params.userId,
        balance: amount,
      },
    });

    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount,
        type: "purchase",
        description: "Credit purchase",
        reference: operationKey,
      },
    });

    const ledger = await tx.creditLedger.create({
      data: {
        userId: params.userId,
        type: "purchase",
        amount,
        description: "Credit purchase",
        reference: params.paymentReference,
        operationKey,
        metadata: params.metadata as never,
      },
    });

    return { wallet, ledger, idempotent: false };
  });
}

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_CREDIT_AMOUNT");
  }

  return Math.ceil(amount);
}
