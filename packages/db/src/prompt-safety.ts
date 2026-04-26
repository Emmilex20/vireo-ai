import { db } from "./index";

export async function logBlockedPrompt(params: {
  userId?: string | null;
  prompt: string;
  negativePrompt?: string | null;
  reason: string;
  matchedTerm?: string | null;
}) {
  return db.promptSafetyLog.create({
    data: {
      userId: params.userId ?? null,
      prompt: params.prompt,
      negativePrompt: params.negativePrompt ?? null,
      reason: params.reason,
      matchedTerm: params.matchedTerm ?? null
    }
  });
}
