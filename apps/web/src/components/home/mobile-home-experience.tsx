import { getPublicExploreFeed } from "@vireon/db";
import { unstable_noStore as noStore } from "next/cache";
import { inferMediaType } from "@/lib/media/infer-media-type";

import { MobileHomeExperienceClient } from "./mobile-home-experience-client";

type PublicPost = Awaited<ReturnType<typeof getPublicExploreFeed>>[number];

function normalizePost(post: PublicPost) {
  return {
    id: post.id,
    title:
      post.caption || post.asset.title || post.asset.prompt || "Published creation",
    subtitle:
      post.asset.prompt?.slice(0, 88) ||
      "See what creators are making with prompts, motion, and scene-driven ideas.",
    href: `/a/${post.asset.id}`,
    mediaUrl: post.asset.thumbnailUrl || post.asset.fileUrl,
    mediaType: inferMediaType(post.asset),
    creator: post.user?.username || post.user?.displayName || "creator",
  } as const;
}

function uniqueByCreator(posts: PublicPost[], count: number) {
  const items: ReturnType<typeof normalizePost>[] = [];
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

export async function MobileHomeExperience() {
  noStore();

  const posts = await getPublicExploreFeed();
  const normalized = posts.map(normalizePost);
  const spotlightCards = uniqueByCreator(posts, 4);
  const imageCards = normalized.filter((post) => post.mediaType === "image").slice(0, 10);
  const videoCards = normalized.filter((post) => post.mediaType === "video").slice(0, 10);
  const suitePool = normalized.slice(0, 6);
  const suiteCards = [
    {
      ...(suitePool[0] ?? normalized[0] ?? fallbackCard("suite-smart", "Smart Shot")),
      title: "Smart Shot",
      subtitle: "Storyboard-to-still and motion workflow from one polished prompt.",
      href: "/studio",
    },
    {
      ...(suitePool[1] ?? normalized[1] ?? fallbackCard("suite-edit", "Edit Video")),
      title: "Edit Video",
      subtitle: "Refine generated clips, remix takes, and iterate with clearer direction.",
      href: "/studio",
    },
    {
      ...(suitePool[2] ?? normalized[2] ?? fallbackCard("suite-camera", "Camera Control")),
      title: "Camera Control",
      subtitle: "Guide angle, pace, and movement language across cinematic outputs.",
      href: "/studio",
    },
    {
      ...(suitePool[3] ?? normalized[3] ?? fallbackCard("suite-upscale", "Image Upscale")),
      title: "Image Upscale",
      subtitle: "Sharpen promising images and prepare them for motion or publishing.",
      href: "/studio",
    },
  ];

  return (
    <div className="sm:hidden">
      <MobileHomeExperienceClient
        spotlightCards={spotlightCards}
        suiteCards={suiteCards}
        inspirationImageCards={imageCards}
        inspirationVideoCards={videoCards}
      />
    </div>
  );
}

function fallbackCard(id: string, title: string) {
  return {
    id,
    title,
    subtitle: "Create something sharp, cinematic, and ready to share.",
    href: "/studio",
    mediaUrl: null,
    mediaType: "image" as const,
    creator: "vireon",
  };
}
