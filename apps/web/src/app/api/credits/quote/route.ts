import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateGenerationCredits } from "@/lib/credits/pricing";

const optionalString = z.string().optional().nullable();
const optionalNumber = z.number().optional().nullable();
const optionalBoolean = z.boolean().optional().nullable();

const quoteSchema = z
  .object({
    generationType: z.enum([
      "image",
      "video",
      "audio",
      "character",
      "video-project",
    ]),
    modelTier: z.enum(["cheap", "standard", "premium"]).optional(),
    modelId: optionalString,
    modelBaseCredits: optionalNumber,
    prompt: optionalString,
    negativePrompt: optionalString,
    durationSeconds: z.number().positive().optional().nullable(),
    duration: z.number().positive().optional().nullable(),
    resolution: optionalString,
    qualityMode: optionalString,
    numberOfOutputs: z.number().int().positive().max(20).optional().nullable(),
    imageToVideo: optionalBoolean,
    referenceImageUrl: optionalString,
    imageUrl: optionalString,
    endImageUrl: optionalString,
    startFrameUrl: optionalString,
    endFrameUrl: optionalString,
    referenceImageUrls: z.array(z.string()).max(16).optional().nullable(),
    audioUrl: optionalString,
    audioUploadUrl: optionalString,
    referenceImageCount: z.number().int().min(0).max(32).optional().nullable(),
    referenceVideoCount: z.number().int().min(0).max(16).optional().nullable(),
    referenceAudioCount: z.number().int().min(0).max(16).optional().nullable(),
    style: optionalString,
    aspectRatio: optionalString,
    promptBoost: optionalBoolean,
    seed: optionalNumber,
    steps: optionalNumber,
    guidance: optionalNumber,
    draft: optionalBoolean,
    saveAudio: optionalBoolean,
    promptUpsampling: optionalBoolean,
    disableSafetyFilter: optionalBoolean,
    sourceAssetId: optionalString,
    motionIntensity: optionalString,
    cameraMove: optionalString,
    styleStrength: optionalString,
    motionGuidance: optionalNumber,
    shotType: optionalString,
    fps: optionalNumber,
    voiceId: optionalString,
    voicePresetId: optionalString,
    languageCode: optionalString,
    emotion: optionalString,
    speed: optionalNumber,
    stability: optionalNumber,
    similarityBoost: optionalNumber,
    pitch: optionalNumber,
    volume: optionalNumber,
    tone: optionalNumber,
    intensity: optionalNumber,
    timbre: optionalNumber,
    settings: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .passthrough();

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid credit quote request",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const quote = calculateGenerationCredits({
    ...parsed.data,
    durationSeconds:
      parsed.data.durationSeconds ?? parsed.data.duration ?? undefined,
  });

  return NextResponse.json({
    requiredCredits: quote.credits,
    breakdown: quote.breakdown,
  });
}
