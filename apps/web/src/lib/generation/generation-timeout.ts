export function isGenerationTimedOut(params: {
  createdAt: Date | string;
  maxMinutes?: number;
}) {
  const maxMinutes =
    params.maxMinutes ??
    Number(process.env.GENERATION_MAX_PROCESSING_MINUTES ?? 30);
  const ageMs = Date.now() - new Date(params.createdAt).getTime();

  return ageMs > maxMinutes * 60 * 1000;
}
