import type { Metadata } from "next";
import { GalleryPageClient } from "@/components/gallery/gallery-page-client";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { SEO_KEYWORDS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Explore AI Images, Videos & Creator Prompts | Vireon AI",
  description:
    "Explore public AI-generated images, videos, cinematic prompts, character concepts, and creator projects made with Vireon AI.",
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: absoluteUrl("/explore")
  },
  openGraph: {
    title: "Explore AI Images, Videos & Creator Prompts | Vireon AI",
    description:
      "Discover public AI-generated images, videos, prompts, and visual projects from creators on Vireon AI.",
    type: "website",
    url: absoluteUrl("/explore")
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore AI Images & Videos | Vireon AI",
    description:
      "Browse public AI images, AI videos, prompts, and creator projects made with Vireon AI."
  }
};

export default function PublicExplorePage() {
  return (
    <PublicSiteFrame>
      <GalleryPageClient />
    </PublicSiteFrame>
  );
}
