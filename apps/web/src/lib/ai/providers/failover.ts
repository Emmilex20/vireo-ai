export const IMAGE_PROVIDER_PRIORITY = ["replicate-image", "mock-image"];
export const VIDEO_PROVIDER_PRIORITY = ["replicate-video", "mock-video"];

export function getFallbackProviderName(params: {
  type: "image" | "video";
  currentProviderName?: string | null;
}) {
  const list =
    params.type === "image" ? IMAGE_PROVIDER_PRIORITY : VIDEO_PROVIDER_PRIORITY;

  const currentIndex = list.findIndex(
    (providerName) => providerName === params.currentProviderName
  );

  if (currentIndex === -1) {
    return list[0] ?? null;
  }

  return list[currentIndex + 1] ?? null;
}
