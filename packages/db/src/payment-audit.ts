import { db } from "./index";

export async function createPaymentAuditLog(params: {
  reference?: string | null;
  provider: string;
  eventType: string;
  status: "accepted" | "rejected" | "error";
  reason?: string;
  rawPayload?: unknown;
}) {
  return db.paymentAuditLog.create({
    data: {
      reference: params.reference ?? null,
      provider: params.provider,
      eventType: params.eventType,
      status: params.status,
      reason: params.reason ?? null,
      rawPayload: params.rawPayload as never,
    },
  });
}
