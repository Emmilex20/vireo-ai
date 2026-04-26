import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createVideoJob,
  deductCredits,
  failVideoJob,
  logBlockedPrompt
} from "@vireon/db";
import { getVideoProvider } from "@/lib/ai/providers/registry";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import { enqueueGenerationJob } from "@/lib/queue/generation-queue";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";
import { checkPromptSafety } from "@/lib/security/prompt-safety";

const VIDEO_COST = 40;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkRedisRateLimit({
      key: `generate:video:${userId}`,
      limit: 10,
      windowSeconds: 60 * 60
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Video generation limit reached. Please try again later.",
          resetAt: limit.resetAt
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    const {
      prompt,
      negativePrompt,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      imageUrl,
      sourceAssetId
    }: {
      prompt?: string;
      negativePrompt?: string;
      duration?: number;
      aspectRatio?: string;
      motionIntensity?: string;
      cameraMove?: string;
      styleStrength?: string;
      motionGuidance?: number;
      shotType?: string;
      fps?: number;
      imageUrl?: string;
      sourceAssetId?: string;
    } = body;

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters" },
        { status: 400 }
      );
    }

    const safety = checkPromptSafety(prompt, negativePrompt);

    if (!safety.allowed) {
      await logBlockedPrompt({
        userId,
        prompt,
        negativePrompt,
        reason: safety.reason!,
        matchedTerm: safety.matchedTerm
      });

      return NextResponse.json(
        {
          error: safety.reason
        },
        { status: 400 }
      );
    }

    const provider = getVideoProvider();

    const providerJob = await provider.createVideoJob({
      prompt,
      negativePrompt,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
      imageUrl
    });

    const job = await createVideoJob({
      userId,
      prompt,
      negativePrompt,
      sourceImageUrl: imageUrl,
      sourceAssetId,
      credits: VIDEO_COST,
      providerName: provider.name,
      providerJobId: providerJob.providerJobId,
      duration,
      aspectRatio,
      motionIntensity,
      cameraMove,
      styleStrength,
      motionGuidance,
      shotType,
      fps,
    });

    try {
      const [wallet] = await deductCredits({
        userId,
        amount: VIDEO_COST,
        description: "Video generation",
        generationJobId: job.id,
      });

      await sendLowCreditsEmailIfNeeded({
        userId,
        balance: wallet.balance
      });

      await enqueueGenerationJob(job.id);
    } catch (error) {
      await failVideoJob(
        job.id,
        error instanceof Error && error.message === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits for video generation"
          : "Failed to queue video generation"
      );
      throw error;
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      providerName: job.providerName,
      providerJobId: job.providerJobId,
      meta: {
        duration: duration ?? 5,
        aspectRatio: aspectRatio ?? "16:9",
        motionIntensity: motionIntensity ?? "medium",
        cameraMove: cameraMove ?? "Slow Push In",
        styleStrength: styleStrength ?? "medium",
        motionGuidance: motionGuidance ?? 6,
        shotType: shotType ?? "Wide Shot",
        fps: fps ?? 24,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 400 }
      );
    }

    console.error("[api/generate/video] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to create video job" },
      { status: 500 }
    );
  }
}
