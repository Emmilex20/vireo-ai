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

  if (existing) return existing

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
