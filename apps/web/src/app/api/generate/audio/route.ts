import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createAudioJob,
  failAudioJob,
  logBlockedPrompt,
  updateGenerationJobProvider,
} from "@vireon/db";
import {
  isReplicateAudioModelId,
  resolveReplicateAudioModel,
} from "@/lib/ai/providers/replicate-audio-models";
import { isValidAudioVoiceForModel } from "@/lib/ai/providers/audio-voices";
import { getAudioProvider } from "@/lib/ai/providers/registry";
import { InsufficientCreditsError, reserveCredits } from "@/lib/credits/credit-service";
import { calculateGenerationCredits } from "@/lib/credits/pricing";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { runGenerationJobInline } from "@/lib/generation/run-inline-generation";
import { isWorkersMode } from "@/lib/runtime/background-mode";
import { checkPromptSafety } from "@/lib/security/prompt-safety";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";

export const maxDuration = 300;

const AUDIO_VOICE_MAP = {
  veer: {
    eleven: "Rachel",
    minimax: "English_Deep-VoicedGentleman",
  },
  nova: {
    eleven: "Aria",
    minimax: "English_Wiselady",
  },
  atlas: {
    eleven: "Clyde",
    minimax: "English_Deep-VoicedGentleman",
  },
} as const;

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, number));
}

function resolveAudioVoice(params: {
  voicePresetId?: string;
  provider: "ElevenLabs" | "MiniMax";
  fallback: string;
}) {
  const voice = AUDIO_VOICE_MAP[params.voicePresetId as keyof typeof AUDIO_VOICE_MAP];

  if (!voice) {
    return params.fallback;
  }

  return params.provider === "MiniMax" ? voice.minimax : voice.eleven;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkRedisRateLimit({
      key: `generate:audio:${userId}`,
      limit: 30,
      windowSeconds: 60 * 60,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Audio generation limit reached. Please try again later.",
          resetAt: limit.resetAt,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      prompt,
      modelId,
      voiceId,
      voicePresetId,
      speed,
      stability,
      similarityBoost,
      style,
      languageCode,
      emotion,
      pitch,
      volume,
      tone,
      intensity,
      timbre,
    }: {
      prompt?: string;
      modelId?: string;
      voiceId?: string;
      voicePresetId?: string;
      speed?: number;
      stability?: number;
      similarityBoost?: number;
      style?: number;
      languageCode?: string;
      emotion?: string;
      pitch?: number;
      volume?: number;
      tone?: number;
      intensity?: number;
      timbre?: number;
    } = body;

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (modelId && !isReplicateAudioModelId(modelId)) {
      return NextResponse.json(
        { error: "Unsupported audio model selected." },
        { status: 400 }
      );
    }

    const safety = checkPromptSafety(prompt);

    if (!safety.allowed) {
      await logBlockedPrompt({
        userId,
        prompt,
        reason: safety.reason!,
        matchedTerm: safety.matchedTerm,
      });

      return NextResponse.json({ error: safety.reason }, { status: 400 });
    }

    const provider = getAudioProvider();
    const workersMode = await isWorkersMode();
    const selectedModel = resolveReplicateAudioModel(modelId);
    const audioQuote = calculateGenerationCredits({
      generationType: "audio",
      modelId: selectedModel.id,
      modelTier: selectedModel.tier,
      prompt,
      numberOfOutputs: 1,
    });
    const audioCost = Math.max(audioQuote.credits, selectedModel.defaultCredits);
    const supportsElevenControls =
      selectedModel.id === "elevenlabs/v2-multilingual";
    const supportsMiniMaxControls = selectedModel.provider === "MiniMax";
    const selectedVoice =
      voiceId ??
      resolveAudioVoice({
        voicePresetId,
        provider: selectedModel.provider,
        fallback: selectedModel.defaultVoiceId,
      });

    if (
      voiceId &&
      !(await isValidAudioVoiceForModel(selectedModel.id, selectedVoice))
    ) {
      return NextResponse.json(
        { error: "Unsupported voice selected for this audio model." },
        { status: 400 }
      );
    }
    const normalizedSpeed = clampNumber(speed, 0.5, 2, 1);
    const normalizedStability = clampNumber(stability, 0, 1, 0.5);
    const normalizedSimilarity = clampNumber(similarityBoost, 0, 1, 0.75);
    const normalizedStyle = clampNumber(style, 0, 1, 0);
    const normalizedTone = clampNumber(tone, -1, 1, 0);
    const normalizedIntensity = clampNumber(intensity, -1, 1, 0);
    const normalizedTimbre = clampNumber(timbre, -1, 1, 0);
    const normalizedPitch = clampNumber(
      (pitch ?? 0) + normalizedTone * 2 + normalizedTimbre,
      -12,
      12,
      0
    );
    const normalizedVolume = clampNumber(
      (volume ?? 1) + normalizedIntensity * 2,
      0,
      10,
      1
    );
    const audioSettings = {
      kind: "audio",
      modelId: selectedModel.id,
      modelLabel: selectedModel.label,
      provider: selectedModel.provider,
      voicePresetId: voicePresetId ?? null,
      voiceId: selectedVoice,
      providerVoiceId: selectedVoice,
      controls: selectedModel.id === "elevenlabs/v3"
        ? {}
        : supportsElevenControls
          ? {
              speed: normalizedSpeed,
              stability: normalizedStability,
              similarityBoost: normalizedSimilarity,
              style: normalizedStyle,
              languageCode: languageCode ?? null,
            }
          : {
              speed: normalizedSpeed,
              volume: clampNumber(volume, 0, 10, 1),
              pitch: clampNumber(pitch, -12, 12, 0),
              tone: normalizedTone,
              intensity: normalizedIntensity,
              timbre: normalizedTimbre,
              effectiveVolume: normalizedVolume,
              effectivePitch: normalizedPitch,
              emotion: emotion ?? null,
            },
    };

    const job = await createAudioJob({
      userId,
      prompt,
      modelId: selectedModel.id,
      credits: audioCost,
      providerName: provider.name,
      style: voicePresetId ?? selectedVoice,
      speed: selectedModel.id === "elevenlabs/v3" ? undefined : normalizedSpeed,
      settings: audioSettings,
    });

    try {
      const { wallet } = await reserveCredits({
        userId,
        amount: audioCost,
        generationId: job.id,
        reason: "Audio generation",
        metadata: {
          quote: audioQuote,
          modelId: selectedModel.id,
          generationType: "audio",
          audioSettings,
        },
      });

      await sendLowCreditsEmailIfNeeded({
        userId,
        balance: wallet.balance,
      });

      const providerJob = await provider.createAudioJob({
        prompt,
        modelId: selectedModel.id,
        voiceId: selectedVoice,
        voice: selectedVoice,
        speed: supportsElevenControls || supportsMiniMaxControls ? normalizedSpeed : undefined,
        stability: supportsElevenControls ? normalizedStability : undefined,
        similarityBoost: supportsElevenControls ? normalizedSimilarity : undefined,
        style: supportsElevenControls ? normalizedStyle : undefined,
        languageCode,
        emotion: supportsMiniMaxControls ? emotion : undefined,
        pitch: supportsMiniMaxControls ? normalizedPitch : undefined,
        volume: supportsMiniMaxControls ? normalizedVolume : undefined,
      });

      const queuedJob = await updateGenerationJobProvider({
        jobId: job.id,
        providerName: provider.name,
        providerJobId: providerJob.providerJobId,
      });

      if (workersMode) {
        const { enqueueGenerationJob } = await import(
          "@/lib/queue/generation-queue"
        );
        await enqueueGenerationJob(job.id);
        return NextResponse.json({
          success: true,
          jobId: queuedJob.id,
          status: queuedJob.status,
          providerName: queuedJob.providerName,
          providerJobId: queuedJob.providerJobId,
          meta: {
            modelId: selectedModel.id,
            voiceId: selectedVoice,
            voicePresetId: voicePresetId ?? null,
            credits: audioCost,
            creditBreakdown: audioQuote.breakdown,
            settings: audioSettings,
          },
        });
      }

      const finalJob = await runGenerationJobInline({
        id: job.id,
        userId: job.userId,
        type: job.type,
        status: job.status,
        providerName: queuedJob.providerName,
        providerJobId: queuedJob.providerJobId,
        prompt: job.prompt,
        style: job.style,
        guidance: job.guidance,
      });

      return NextResponse.json({
        success: true,
        jobId: finalJob.id,
        status: finalJob.status,
        outputUrl: finalJob.outputUrl ?? null,
        failureReason: finalJob.failureReason ?? null,
        providerName: finalJob.providerName,
        providerJobId: finalJob.providerJobId,
        inlineProcessed: true,
        meta: {
          modelId: selectedModel.id,
          voiceId: selectedVoice,
          voicePresetId: voicePresetId ?? null,
          credits: audioCost,
          creditBreakdown: audioQuote.breakdown,
          settings: audioSettings,
        },
      });
    } catch (error) {
      await failAudioJob(
        job.id,
        error instanceof Error && error.message === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits for audio generation"
          : "Failed to queue audio generation"
      );
      throw error;
    }
  } catch (error: unknown) {
    if (
      error instanceof InsufficientCreditsError ||
      (error instanceof Error && error.message === "INSUFFICIENT_CREDITS")
    ) {
      const requiredCredits =
        error instanceof InsufficientCreditsError ? error.requiredCredits : 0;
      const availableCredits =
        error instanceof InsufficientCreditsError ? error.availableCredits : 0;

      return NextResponse.json(
        {
          error: "INSUFFICIENT_CREDITS",
          requiredCredits,
          availableCredits,
          message: `You need ${requiredCredits} credits to run this generation.`,
        },
        { status: 402 }
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes("Insufficient credit") ||
        error.message.includes("402 Payment Required"))
    ) {
      return NextResponse.json(
        {
          error:
            "Replicate account has insufficient credit to run this audio model. Add billing credit in Replicate and try again.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "REPLICATE_API_TOKEN is not set"
    ) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not set" },
        { status: 500 }
      );
    }

    console.error("[api/generate/audio] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to create audio job",
        ...(process.env.NODE_ENV !== "production"
          ? {
              debug: error instanceof Error ? error.message : String(error),
            }
          : {}),
      },
      { status: 500 }
    );
  }
}
