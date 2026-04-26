export type AiProvider = "replicate" | "fal" | "runpod";

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export async function generateImageMock(input: GenerateImageInput) {
  return {
    provider: "mock",
    prompt: input.prompt,
    status: "queued"
  };
}
