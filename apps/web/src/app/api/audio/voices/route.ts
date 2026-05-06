import { NextResponse } from "next/server";

import { getAudioVoicesForModel } from "@/lib/ai/providers/audio-voices";
import {
  isReplicateAudioModelId,
  resolveReplicateAudioModel,
} from "@/lib/ai/providers/replicate-audio-models";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const modelId = searchParams.get("modelId");

  if (modelId && !isReplicateAudioModelId(modelId)) {
    return NextResponse.json(
      { error: "Unsupported audio model selected." },
      { status: 400 }
    );
  }

  const model = resolveReplicateAudioModel(modelId);
  const voices = await getAudioVoicesForModel(model.id);

  return NextResponse.json({
    modelId: model.id,
    voices,
  });
}
