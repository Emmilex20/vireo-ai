import type { Metadata } from "next";
import { DiscoverCreatorsClient } from "@/components/creators/discover-creators-client";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Discover AI Creators | Vireon AI",
  description:
    "Find and follow AI creators making images, videos, characters, cinematic visual work, and prompt-driven projects on Vireon AI.",
  alternates: {
    canonical: absoluteUrl("/creators")
  },
  openGraph: {
    title: "Discover AI Creators | Vireon AI",
    description:
      "Follow AI creators and discover public AI-generated images, videos, prompts, and visual content.",
    type: "website",
    url: absoluteUrl("/creators")
  }
};

export default function CreatorsPage() {
  return (
    <PublicSiteFrame>
      <DiscoverCreatorsClient />
    </PublicSiteFrame>
  );
}
