import { db } from "./index"

export async function deletePromptDraft(params: {
  userId: string
  draftId: string
}) {
  const draft = await db.promptDraft.findFirst({
    where: {
      id: params.draftId,
      userId: params.userId,
    },
  })

  if (!draft) {
    throw new Error("DRAFT_NOT_FOUND")
  }

  await db.promptDraft.delete({
    where: {
      id: params.draftId,
    },
  })

  return { success: true }
}
