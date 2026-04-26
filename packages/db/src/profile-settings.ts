import { db } from "./index"

export async function getMyCreatorProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      username: true,
      avatarUrl: true,
      bio: true,
    },
  })
}

export async function updateMyCreatorProfile(params: {
  userId: string
  displayName?: string
  username?: string
  avatarUrl?: string
  bio?: string
}) {
  const username = params.username?.trim().toLowerCase()

  if (username && !/^[a-z0-9_]{3,24}$/.test(username)) {
    throw new Error("INVALID_USERNAME")
  }

  return db.user.update({
    where: { id: params.userId },
    data: {
      displayName: params.displayName?.trim() || null,
      username: username || null,
      avatarUrl: params.avatarUrl?.trim() || null,
      bio: params.bio?.trim() || null,
    },
    select: {
      displayName: true,
      username: true,
      avatarUrl: true,
      bio: true,
    },
  })
}
