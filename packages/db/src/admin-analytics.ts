import { db } from "./index";

export async function getAdminAnalytics() {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    creditsUsed,
    imageJobs,
    videoJobs,
    exports,
    revenueCredits
  ] = await Promise.all([
    db.user.count(),

    db.user.count({
      where: {
        updatedAt: {
          gte: last7Days
        }
      }
    }),

    db.creditLedger.aggregate({
      _sum: { amount: true },
      where: {
        type: "deduction"
      }
    }),

    db.generationJob.count({
      where: { type: "image" }
    }),

    db.generationJob.count({
      where: { type: "video" }
    }),

    db.videoProjectExport.count(),

    db.creditLedger.aggregate({
      _sum: { amount: true },
      where: {
        type: "purchase"
      }
    })
  ]);

  return {
    totalUsers,
    activeUsers,
    creditsUsed: Math.abs(creditsUsed._sum.amount || 0),
    imageJobs,
    videoJobs,
    exports,
    revenueCredits: revenueCredits._sum.amount || 0
  };
}
