import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isValidAudioVoiceForModel } from "@/lib/ai/providers/audio-voices";
import { getAudioProvider } from "@/lib/ai/providers/registry";
import {
  isReplicateAudioModelId,
  resolveReplicateAudioModel,
} from "@/lib/ai/providers/replicate-audio-models";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";

export const maxDuration = 120;

const PREVIEW_PROMPT =
  "This is a Vireon voice preview, generated with the selected model and voice.";

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, number));
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkRedisRateLimit({
      key: `audio-preview:${userId}`,
      limit: 40,
      windowSeconds: 60 * 60,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Voice preview limit reached. Please try again later.",
          resetAt: limit.resetAt,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      modelId?: string;
      voiceId?: string;
      speed?: number;
      stability?: number;
      similarityBoost?: number;
      style?: number;
      emotion?: string;
      pitch?: number;
      volume?: number;
      tone?: number;
      intensity?: number;
      timbre?: number;
    };

    if (body.modelId && !isReplicateAudioModelId(body.modelId)) {
      return NextResponse.json(
        { error: "Unsupported audio model selected." },
        { status: 400 }
      );
    }

    const selectedModel = resolveReplicateAudioModel(body.modelId);
    const voiceId = body.voiceId ?? selectedModel.defaultVoiceId;

    if (!(await isValidAudioVoiceForModel(selectedModel.id, voiceId))) {
      return NextResponse.json(
        { error: "Unsupported voice selected for this audio model." },
        { status: 400 }
      );
    }

    const provider = getAudioProvider();
    const supportsElevenControls =
      selectedModel.id === "elevenlabs/v2-multilingual";
    const supportsMiniMaxControls = selectedModel.provider === "MiniMax";
    const normalizedSpeed = clampNumber(body.speed, 0.5, 2, 1);
    const normalizedTone = clampNumber(body.tone, -1, 1, 0);
    const normalizedIntensity = clampNumber(body.intensity, -1, 1, 0);
    const normalizedTimbre = clampNumber(body.timbre, -1, 1, 0);
    const normalizedPitch = clampNumber(
      (body.pitch ?? 0) + normalizedTone * 2 + normalizedTimbre,
      -12,
      12,
      0
    );
    const normalizedVolume = clampNumber(
      (body.volume ?? 1) + normalizedIntensity * 2,
      0,
      10,
      1
    );

    const providerJob = await provider.createAudioJob({
      prompt: PREVIEW_PROMPT,
      modelId: selectedModel.id,
      voiceId,
      voice: voiceId,
      speed: selectedModel.id === "elevenlabs/v3" ? undefined : normalizedSpeed,
      stability: supportsElevenControls
        ? clampNumber(body.stability, 0, 1, 0.5)
        : undefined,
      similarityBoost: supportsElevenControls
        ? clampNumber(body.similarityBoost, 0, 1, 0.75)
        : undefined,
      style: supportsElevenControls ? clampNumber(body.style, 0, 1, 0) : undefined,
      emotion: supportsMiniMaxControls ? body.emotion : undefined,
      pitch: supportsMiniMaxControls ? normalizedPitch : undefined,
      volume: supportsMiniMaxControls ? normalizedVolume : undefined,
    });

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const status = await provider.getAudioJobStatus(providerJob.providerJobId);

      if (status.status === "completed" && status.outputUrl) {
        return NextResponse.json({
          success: true,
          outputUrl: status.outputUrl,
          modelId: selectedModel.id,
          voiceId,
        });
      }

      if (status.status === "failed") {
        return NextResponse.json(
          { error: status.error ?? "Voice preview failed." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Voice preview timed out. Please try again." },
      { status: 504 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "REPLICATE_API_TOKEN is not set"
    ) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate voice preview.",
      },
      { status: 500 }
    );
  }
}
