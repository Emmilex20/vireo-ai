import { db } from "./index";

export async function getModerationAuditLogs() {
  return db.moderationAuditLog.findMany({
    include: {
      asset: {
        select: {
          id: true,
          title: true,
          prompt: true,
          fileUrl: true,
          user: {
            select: {
              email: true,
              username: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
