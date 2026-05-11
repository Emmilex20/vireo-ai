export const IMAGE_PROVIDER_PRIORITY = ["replicate-image", "mock-image"];

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
