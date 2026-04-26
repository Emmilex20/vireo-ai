import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getImageProvider } from "@/lib/ai/providers/registry";
import { enqueueGenerationJob } from "@/lib/queue/generation-queue";
import { checkRedisRateLimit } from "@/lib/security/redis-rate-limit";
import { checkPromptSafety } from "@/lib/security/prompt-safety";
import { sendLowCreditsEmailIfNeeded } from "@/lib/email/notifications";
import {
  createImageJob,
  deductCredits,
  failImageJob,
  logBlockedPrompt
} from "@vireon/db";

const IMAGE_COST = 5;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkRedisRateLimit({
      key: `generate:image:${userId}`,
      limit: 20,
      windowSeconds: 60 * 60
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Image generation limit reached. Please try again later.",
          resetAt: limit.resetAt
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    const {
      prompt,
      negativePrompt,
      style,
      aspectRatio,
      qualityMode,
      promptBoost,
      seed,
      steps,
      guidance,
    }: {
      prompt?: string;
      negativePrompt?: string;
      style?: string;
      aspectRatio?: string;
      qualityMode?: "standard" | "high" | "ultra";
      promptBoost?: boolean;
      seed?: number | null;
      steps?: number;
      guidance?: number;
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

    const provider = getImageProvider();

    const providerJob = await provider.createImageJob({
      prompt,
      negativePrompt,
      style,
      aspectRatio,
      qualityMode,
      promptBoost,
      seed,
      steps,
      guidance,
    });

    const job = await createImageJob({
      userId,
      prompt,
      negativePrompt,
      credits: IMAGE_COST,
      providerName: provider.name,
      providerJobId: providerJob.providerJobId,
      style,
      aspectRatio,
      qualityMode,
      promptBoost,
      seed,
      steps,
      guidance,
    });

    try {
      const [wallet] = await deductCredits({
        userId,
        amount: IMAGE_COST,
        description: "Image generation",
        generationJobId: job.id,
      });

      await sendLowCreditsEmailIfNeeded({
        userId,
        balance: wallet.balance
      });

      await enqueueGenerationJob(job.id);
    } catch (error) {
      await failImageJob(
        job.id,
        error instanceof Error && error.message === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits for image generation"
          : "Failed to queue image generation"
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
        style: style ?? "Cinematic",
        aspectRatio: aspectRatio ?? "4:3",
        qualityMode: qualityMode ?? "high",
        promptBoost: promptBoost ?? true,
        seed: seed ?? null,
        steps: steps ?? 30,
        guidance: guidance ?? 7.5,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 400 }
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
            "Replicate account has insufficient credit to run this model. Add billing credit in Replicate and try again.",
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

    console.error("[api/generate/image] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to create image job" },
      { status: 500 }
    );
  }
}
