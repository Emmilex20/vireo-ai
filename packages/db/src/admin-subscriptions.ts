import { db } from "./index";

export async function getAdminSubscriptionStats() {
  const [active, cancelPending, cancelled, renewals] = await Promise.all([
    db.subscription.count({ where: { status: "active" } }),
    db.subscription.count({ where: { status: "cancel_pending" } }),
    db.subscription.count({ where: { status: "cancelled" } }),
    db.subscriptionRenewal.count()
  ]);

  const subscriptions = await db.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return {
    stats: { active, cancelPending, cancelled, renewals },
    subscriptions
  };
}
