import { db } from "./index";

export async function getAdminCreditAdjustments() {
  return db.creditLedger.findMany({
    where: {
      type: "admin_adjustment",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}
