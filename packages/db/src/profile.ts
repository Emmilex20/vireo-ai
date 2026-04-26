import { db } from "./index"

export async function getOwnProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  })

  return user
}

export async function upsertOwnProfile(params: {
  userId: string
  username?: string
  fullName?: string
  bio?: string
  website?: string
  location?: string
}) {
  const username = params.username?.trim() || null
  const fullName = params.fullName?.trim() || null
  const bio = params.bio?.trim() || null
  const website = params.website?.trim() || null
  const location = params.location?.trim() || null

  if (username && username.length < 3) {
    throw new Error("USERNAME_TOO_SHORT")
  }

  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error("USERNAME_INVALID")
  }

  const existingUserWithUsername = username
    ? await db.user.findFirst({
        where: {
          username,
          NOT: {
            id: params.userId,
          },
        },
      })
    : null

  if (existingUserWithUsername) {
    throw new Error("USERNAME_TAKEN")
  }

  await db.user.update({
    where: { id: params.userId },
    data: {
      username,
      fullName,
    },
  })

  const existingProfile = await db.profile.findUnique({
    where: { userId: params.userId },
  })

  if (existingProfile) {
    return db.profile.update({
      where: { userId: params.userId },
      data: {
        bio,
        website,
        location,
      },
    })
  }

  return db.profile.create({
    data: {
      userId: params.userId,
      bio,
      website,
      location,
    },
  })
}
