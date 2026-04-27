import type { Metadata } from "next";
import { CreatorProfileClient } from "@/components/creators/creator-profile-client";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const res = await fetch(`${APP_URL}/api/public/creator/${username}`, {
    cache: "no-store"
  });

  let creator: any = null;

  if (res.ok) {
    const data = await res.json();
    creator = data.creator;
  }

  const displayName = creator?.displayName || username;
  const description =
    creator?.bio ||
    `Explore AI-generated images and videos by @${username} on Vireon AI.`;

  const image = creator?.avatarUrl || `${APP_URL}/default-avatar.png`;

  return {
    title: `${displayName} (@${username}) | Vireon AI`,
    description,
    alternates: {
      canonical: `${APP_URL}/u/${username}`
    },
    openGraph: {
      title: `${displayName} (@${username})`,
      description,
      type: "profile",
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
  const res = await fetch(`${APP_URL}/api/public/creator/${username}`, {
    cache: "no-store"
  });

  let creator: any = null;

  if (res.ok) {
    const data = await res.json();
    creator = data.creator;
  }

  return (
    <PublicSiteFrame>
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: creator?.displayName || username,
              alternateName: `@${username}`,
              url: `${APP_URL}/u/${username}`,
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
