import type { Metadata } from "next";
import { GalleryPageClient } from "@/components/gallery/gallery-page-client";

export const metadata: Metadata = {
  title: "Explore | Vireon AI",
  description:
    "Explore public AI-generated images and videos created by Vireon AI creators.",
  openGraph: {
    title: "Explore | Vireon AI",
    description:
      "Discover public AI-generated images and videos from creators on Vireon AI.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore | Vireon AI",
    description:
      "Explore public AI-generated images and videos created with Vireon AI."
  }
};

export default function PublicExplorePage() {
  return <GalleryPageClient />;
}
