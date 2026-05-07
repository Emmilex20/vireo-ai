import type { Metadata } from "next";
import { getPublicCreatorProfile } from "@vireon/db";
import { CreatorProfileClient } from "@/components/creators/creator-profile-client";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { SEO_KEYWORDS } from "@/lib/constants";
import { absoluteUrl, seoDescription } from "@/lib/seo";

type PublicCreator = Awaited<ReturnType<typeof getPublicCreatorProfile>>;

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  let creator: PublicCreator | null = null;

  try {
    creator = await getPublicCreatorProfile(username);
  } catch {
    creator = null;
  }

  const displayName = creator?.displayName || username;
  const description =
    seoDescription(
      creator?.bio,
      `Explore AI-generated images, videos, characters, prompts, and creator projects by @${username} on Vireon AI.`
    );

  const image = creator?.avatarUrl || absoluteUrl("/logo.png");
  const canonicalUrl = absoluteUrl(`/u/${username}`);

  return {
    title: `${displayName} (@${username}) | Vireon AI`,
    description,
    keywords: [
      ...SEO_KEYWORDS,
      `${displayName} AI creator`,
      `@${username}`,
      "AI creator portfolio",
      "AI artist profile"
    ],
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `${displayName} (@${username})`,
      description,
      type: "profile",
      url: canonicalUrl,
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (@${username})`,
      description,
      images: [image]
    }
  };
}

export default async function CreatorPage({ params }: Props) {
  const { username } = await params;
  let creator: PublicCreator | null = null;

  try {
    creator = await getPublicCreatorProfile(username);
  } catch {
    creator = null;
  }

  return (
    <PublicSiteFrame>
      <main className="mx-auto w-full max-w-350 px-4 py-8 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: creator?.displayName || username,
              alternateName: `@${username}`,
              url: absoluteUrl(`/u/${username}`),
              image: creator?.avatarUrl,
              description:
                creator?.bio ||
                "AI creator on Vireon AI creating images and videos.",
              interactionStatistic: [
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/FollowAction",
                  userInteractionCount: creator?._count?.followers || 0
                }
              ]
            })
          }}
        />

        <CreatorProfileClient username={username} />
      </main>
    </PublicSiteFrame>
  );
}
