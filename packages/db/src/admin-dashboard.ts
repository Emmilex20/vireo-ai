import { db } from "./index";

export async function getAdminDashboardStats() {
  const [users, assets, publicAssets, generationJobs, failedJobs, payments, auditLogs] =
    await Promise.all([
      db.user.count(),
      db.asset.count(),
      db.asset.count({ where: { isPublic: true } }),
      db.generationJob.count(),
      db.generationJob.count({ where: { status: "failed" } }),
      db.payment.count(),
      db.paymentAuditLog.count(),
    ]);

  return {
    users,
    assets,
    publicAssets,
    generationJobs,
    failedJobs,
    payments,
    auditLogs,
  };
}
