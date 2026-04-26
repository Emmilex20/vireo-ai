import { db } from "./index"

export async function getUserCreditLedger(userId: string) {
  return db.creditLedger.findMany({
    where: { userId },
    include: {
      generationJob: {
        select: {
          id: true,
          type: true,
          prompt: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
