import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserGenerationHistory } from "@vireon/db";

type HistoryItem = Awaited<ReturnType<typeof getUserGenerationHistory>>[number] & {
  duration?: number | null;
  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  sourceImageUrl?: string | null;
  sourceAssetId?: string | null;
};

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await getUserGenerationHistory(userId);

  return NextResponse.json({
    history: history.map((item) => {
      const historyItem = item as HistoryItem;

      return {
        ...historyItem,
        mediaType: historyItem.type === "video" ? "video" : "image",

        // image fields
        style: historyItem.type === "image" ? historyItem.style : null,
        qualityMode: historyItem.type === "image" ? historyItem.qualityMode : null,
        promptBoost: historyItem.type === "image" ? historyItem.promptBoost : null,
        seed: historyItem.type === "image" ? historyItem.seed : null,
        steps: historyItem.type === "image" ? historyItem.steps : null,
        guidance: historyItem.type === "image" ? historyItem.guidance : null,

        // video fields
        duration: historyItem.type === "video" ? historyItem.duration : null,
        motionIntensity:
          historyItem.type === "video" ? historyItem.motionIntensity : null,
        cameraMove: historyItem.type === "video" ? historyItem.cameraMove : null,
        styleStrength:
          historyItem.type === "video" ? historyItem.styleStrength : null,
        motionGuidance:
          historyItem.type === "video" ? historyItem.motionGuidance : null,
        shotType: historyItem.type === "video" ? historyItem.shotType : null,
        fps: historyItem.type === "video" ? historyItem.fps : null,
        sourceImageUrl:
          historyItem.type === "video" ? historyItem.sourceImageUrl : null,
        sourceAssetId:
          historyItem.type === "video" ? historyItem.sourceAssetId : null,
        failureReason: historyItem.failureReason,
        refundedAt: historyItem.refundedAt,
      };
    }),
  });
}
