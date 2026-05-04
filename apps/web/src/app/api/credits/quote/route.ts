import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateGenerationCredits } from "@/lib/credits/pricing";

const quoteSchema = z.object({
  generationType: z.enum(["image", "video"]),
  modelTier: z.enum(["cheap", "standard", "premium"]).optional(),
  modelId: z.string().optional().nullable(),
  prompt: z.string().optional().nullable(),
  durationSeconds: z.number().int().positive().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  resolution: z.string().optional().nullable(),
  qualityMode: z.string().optional().nullable(),
  numberOfOutputs: z.number().int().positive().max(8).optional().nullable(),
  imageToVideo: z.boolean().optional(),
  referenceImageUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  endImageUrl: z.string().optional().nullable(),
  referenceImageUrls: z.array(z.string()).optional().nullable(),
  audioUrl: z.string().optional().nullable(),
});

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
