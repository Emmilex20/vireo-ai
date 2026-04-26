import { db } from "./index"

export async function getPaymentByReference(params: {
  userId: string
  reference: string
}) {
  return db.payment.findFirst({
    where: {
      userId: params.userId,
      reference: params.reference,
    },
  })
}
