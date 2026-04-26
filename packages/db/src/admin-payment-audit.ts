import { db } from "./index";

export async function getPaymentAuditLogs() {
  return db.paymentAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
