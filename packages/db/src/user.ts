import { db } from "./index"

const SIGNUP_BONUS = 50

export async function createUserIfNotExists(params: {
  id: string
  email?: string
  fullName?: string
  avatarUrl?: string
}) {
  const existing = await db.user.findUnique({
    where: { id: params.id },
  })

  if (existing) {
    return db.user.update({
      where: { id: params.id },
      data: {
        email: params.email ?? existing.email,
        fullName: params.fullName ?? existing.fullName,
        avatarUrl: params.avatarUrl ?? existing.avatarUrl,
      },
    })
  }

  if (params.email) {
    const existingByEmail = await db.user.findUnique({
      where: { email: params.email },
    })

    if (existingByEmail) {
      return db.user.update({
        where: { id: existingByEmail.id },
        data: {
          id: params.id,
          fullName: params.fullName ?? existingByEmail.fullName,
          avatarUrl: params.avatarUrl ?? existingByEmail.avatarUrl,
        },
      })
    }
  }

  return db.user.create({
    data: {
      id: params.id,
      email: params.email,
      fullName: params.fullName,
      avatarUrl: params.avatarUrl,
      wallet: {
        create: {
          balance: SIGNUP_BONUS,
        },
      },
    },
  })
}
