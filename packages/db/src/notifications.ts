import { db } from "./index"

export async function createNotification(params: {
  userId: string
  actorId?: string
  type: "follow" | "like" | "save" | "comment"
  assetId?: string
}) {
  if (params.userId === params.actorId) return null

  return db.notification.create({
    data: {
      userId: params.userId,
      actorId: params.actorId ?? null,
      type: params.type,
      assetId: params.assetId ?? null,
    },
  })
}

export async function getUserNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    include: {
      actor: {
        select: {
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
      asset: {
        select: {
          id: true,
          title: true,
          fileUrl: true,
          type: true,
          mimeType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function markNotificationsRead(userId: string) {
  return db.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  })
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({
    where: {
      userId,
      read: false,
    },
  })
}
