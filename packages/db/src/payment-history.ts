import { db } from "./index"

export async function getUserPaymentHistory(userId: string) {
  return db.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}
