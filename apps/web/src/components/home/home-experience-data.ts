import {
  getPublishedHomepageItems,
  getPublicExploreFeed,
  type HomepageItemRow,
  type HomepageSection,
} from "@vireon/db";
import { inferMediaType } from "@/lib/media/infer-media-type";

type PublicPost = Awaited<ReturnType<typeof getPublicExploreFeed>>[number];

export type HomeExperienceCard = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  mediaUrl?: string | null;
  posterUrl?: string | null;
  mediaType: "image" | "video";
  creator?: string;
};

function normalizePost(post: PublicPost): HomeExperienceCard {
  const mediaType = inferMediaType(post.asset);
  const isVideo = mediaType === "video";
  const imageUrl = post.asset.thumbnailUrl || post.asset.fileUrl;

  return {
    id: post.id,
    title:
      post.caption ||
      post.asset.title ||
      post.asset.prompt ||
      "Published creation",
    subtitle:
      post.asset.prompt?.slice(0, 96) ||
      "See what creators are making with prompts, motion, and scene-driven ideas.",
    href: `/a/${post.asset.id}`,
    mediaUrl: isVideo ? post.asset.fileUrl : imageUrl,
    posterUrl: isVideo ? post.asset.thumbnailUrl : imageUrl,
    mediaType: isVideo ? "video" : "image",
    creator: post.user?.username || post.user?.displayName || "creator",
  };
}

function normalizeHomepageItem(item: HomepageItemRow): HomeExperienceCard {
  const mediaType =
    item.mediaType === "video"
      ? "video"
      : item.mediaType === "image"
        ? "image"
        : inferMediaType({ mediaType: item.mediaType, fileUrl: item.mediaUrl });

  return {
    id: item.id,
    title: item.title,
    subtitle:
      item.subtitle ||
      "Create something sharp, cinematic, and ready to share.",
    href: item.href || "/studio",
    mediaUrl: item.mediaUrl,
    posterUrl: item.posterUrl,
    mediaType: mediaType === "video" ? "video" : "image",
    creator: "vireon",
  };
}

function fallbackCard(id: string, title: string): HomeExperienceCard {
  return {
    id,
    title,
    subtitle: "Create something sharp, cinematic, and ready to share.",
    href: "/studio",
    mediaUrl: null,
    posterUrl: null,
    mediaType: "image",
    creator: "vireon",
  };
}

function homepageSectionCards(
  items: HomepageItemRow[],
  section: HomepageSection
) {
  return items
    .filter((item) => item.section === section)
    .map(normalizeHomepageItem);
}

function mergeWithFallback(
  customCards: HomeExperienceCard[],
  fallbackCards: HomeExperienceCard[],
  count: number
) {
  const merged = [...customCards];
  const seen = new Set(merged.map((card) => card.id));

  for (const card of fallbackCards) {
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    merged.push(card);
    if (merged.length >= count) break;
  }

  return merged.slice(0, count);
}

function uniqueByCreator(posts: PublicPost[], count: number) {
  const items: HomeExperienceCard[] = [];
  const seen = new Set<string>();

  for (const post of posts) {
    const creator = post.user?.username || post.user?.displayName || post.userId;
    if (seen.has(creator)) continue;
    seen.add(creator);
    items.push(normalizePost(post));
    if (items.length >= count) break;
  }

  return items;
}

function pickCard(
  cards: HomeExperienceCard[],
  index: number,
  fallbackId: string,
  fallbackTitle: string
) {
  return cards[index] ?? cards[0] ?? fallbackCard(fallbackId, fallbackTitle);
}

function decorateCard(
  card: HomeExperienceCard,
  id: string,
  title: string,
  subtitle: string,
  href = "/studio"
): HomeExperienceCard {
  return {
    ...card,
    id,
    title,
    subtitle,
    href,
  };
}

export async function getHomeExperienceData() {
  const [posts, homepageItems] = await Promise.all([
    getPublicExploreFeed(),
    getPublishedHomepageItems().catch((error) => {
      console.error("[home] Failed to load curated homepage items", error);
      return [] as HomepageItemRow[];
    }),
  ]);
  const visualPosts = posts.filter((post) => {
    const mediaType = inferMediaType(post.asset);
    return mediaType === "image" || mediaType === "video";
  });
  const normalized = visualPosts.map(normalizePost);
  const imageCards = normalized.filter((post) => post.mediaType === "image");
  const videoCards = normalized.filter((post) => post.mediaType === "video");

  const spotlightFallbackCards = uniqueByCreator(visualPosts, 4);

  const suiteFallbackCards = [
    decorateCard(
      pickCard(normalized, 0, "suite-smart", "Smart Shot"),
      "suite-smart",
      "Smart Shot",
      "Storyboard sheet + cinematic video from one polished prompt."
    ),
    decorateCard(
      pickCard(normalized, 1, "suite-multi", "Multi View"),
      "suite-multi",
      "Multi View",
      "Generate multiple camera angles from one strong reference."
    ),
    decorateCard(
      pickCard(videoCards, 0, "suite-motion", "Motion Sync"),
      "suite-motion",
      "Motion Sync",
      "Sync motion from a reference clip and guide cinematic movement."
    ),
    decorateCard(
      pickCard(normalized, 2, "suite-lip", "Lip-Sync"),
      "suite-lip",
      "Lip-Sync",
      "Match speech rhythm and expression for character-driven scenes."
    ),
    decorateCard(
      pickCard(videoCards, 1, "suite-edit-video", "Edit Video"),
      "suite-edit-video",
      "Edit Video",
      "Retake, restyle, or extend clips with clearer direction."
    ),
    decorateCard(
      pickCard(imageCards, 1, "suite-camera", "Camera Angle Control"),
      "suite-camera",
      "Camera Angle Control",
      "Control perspective, framing, and scene energy with more intent."
    ),
  ];

  const latestModelFallbackCards = [
    decorateCard(
      pickCard(imageCards, 0, "model-imagen", "Imagen 4 Ultra"),
      "model-imagen",
      "Imagen 4 Ultra",
      "Premium photoreal image generation with rich prompt fidelity"
    ),
    decorateCard(
      pickCard(videoCards, 0, "model-seedance", "Seedance 2.0"),
      "model-seedance",
      "Seedance 2.0",
      "Multi-modal AI video generation"
    ),
    decorateCard(
      pickCard(imageCards, 2, "model-banana", "Nano Banana Pro"),
      "model-banana",
      "Nano Banana Pro",
      "Fast and efficient image generation"
    ),
    decorateCard(
      pickCard(videoCards, 2, "model-kling", "Kling 3.0 Omni"),
      "model-kling",
      "Kling 3.0 Omni",
      "Enhanced multimodal references"
    ),
  ];
  const spotlightCards = mergeWithFallback(
    homepageSectionCards(homepageItems, "spotlight"),
    spotlightFallbackCards,
    4
  );
  const suiteCards = mergeWithFallback(
    homepageSectionCards(homepageItems, "suite"),
    suiteFallbackCards,
    6
  );
  const latestModelCards = mergeWithFallback(
    homepageSectionCards(homepageItems, "latest_models"),
    latestModelFallbackCards,
    4
  );
  const inspirationImageCards = mergeWithFallback(
    homepageSectionCards(homepageItems, "inspiration_image"),
    imageCards,
    12
  );
  const inspirationVideoCards = mergeWithFallback(
    homepageSectionCards(homepageItems, "inspiration_video"),
    videoCards,
    12
  );

  return {
    spotlightCards,
    suiteCards,
    latestModelCards,
    inspirationImageCards,
    inspirationVideoCards,
  };
}
