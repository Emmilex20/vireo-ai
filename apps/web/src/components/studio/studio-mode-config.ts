export type StudioMode = "image" | "video";

export const studioModeConfig: Record<
  StudioMode,
  {
    title: string;
    subtitle: string;
    badge: string;
    helper: string;
  }
> = {
  image: {
    title: "Image Studio",
    subtitle:
      "Craft high-quality still visuals with prompts, presets, and advanced generation controls.",
    badge: "Image Workspace",
    helper: "Best for posters, ads, concept art, portraits, and product visuals.",
  },
  video: {
    title: "Video Studio",
    subtitle:
      "Direct cinematic motion, camera behavior, and temporal style for premium AI video workflows.",
    badge: "Video Workspace",
    helper:
      "Best for short scenes, brand motion, trailers, product reels, and cinematic sequences.",
  },
};
