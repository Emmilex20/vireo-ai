import { db } from "./index";

export async function getAdminUserDetail(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      wallet: {
        select: {
          balance: true,
        },
      },
      _count: {
        select: {
          assets: true,
          jobs: true,
          payments: true,
          followers: true,
          following: true,
        },
      },
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          status: true,
          prompt: true,
          creditsUsed: true,
          failureReason: true,
          createdAt: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          reference: true,
          status: true,
          amount: true,
          currency: true,
          credits: true,
          createdAt: true,
        },
      },
      creditLedger: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });
}
