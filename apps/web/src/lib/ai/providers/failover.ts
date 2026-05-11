export const IMAGE_PROVIDER_PRIORITY = ["replicate-image", "mock-image"];

const NON_FALLBACK_ERROR_PATTERNS = [
  "account balance",
  "balance not enough",
  "billing",
  "insufficient credit",
  "insufficient credits",
  "invalid",
  "not enough credit",
  "not enough credits",
  "payment required",
  "recharge",
  "top up",
  "unsupported",
];

const RETRYABLE_ERROR_PATTERNS = [
  "eai_again",
  "econnrefused",
  "econnreset",
  "enotfound",
  "fetch failed",
  "network",
  "rate limit",
  "rate-limit",
  "service unavailable",
  "socket",
  "temporarily unavailable",
  "timeout",
  "timed out",
  "unable to reach",
];

function readProviderPriority(envValue: string | undefined, fallback: string[]) {
  const providers = envValue
    ?.split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);

  return providers?.length ? providers : fallback;
}

export function getVideoProviderPriority() {
  return readProviderPriority(process.env.AI_VIDEO_PROVIDER_PRIORITY, [
    "replicate-video",
    "mock-video",
  ]);
}

export function getProviderErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function getProviderErrorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return null;
  }

  const status = (error as { status?: unknown }).status;

  return typeof status === "number" ? status : null;
}

function hasPattern(message: string | undefined, patterns: string[]) {
  const normalized = message?.toLowerCase() ?? "";

  return patterns.some((pattern) => normalized.includes(pattern));
}

export function shouldFallbackProviderFailure(params: {
  error?: unknown;
  reason?: string | null;
}) {
  const message =
    params.reason ?? (params.error ? getProviderErrorMessage(params.error) : "");

  if (hasPattern(message, NON_FALLBACK_ERROR_PATTERNS)) {
    return false;
  }

  const status = params.error ? getProviderErrorStatus(params.error) : null;

  if (status !== null) {
    return status === 408 || status === 409 || status === 429 || status >= 500;
  }

  return hasPattern(message, RETRYABLE_ERROR_PATTERNS);
}

export function getFallbackProviderName(params: {
  type: "image" | "video";
  currentProviderName?: string | null;
}) {
  const list =
    params.type === "image" ? IMAGE_PROVIDER_PRIORITY : getVideoProviderPriority();

  const currentIndex = list.findIndex(
    (providerName) => providerName === params.currentProviderName
  );

  if (currentIndex === -1) {
    return list[0] ?? null;
  }

  return list[currentIndex + 1] ?? null;
}
