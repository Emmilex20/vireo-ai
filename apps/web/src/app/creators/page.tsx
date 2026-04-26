import type { Metadata } from "next";
import { DiscoverCreatorsClient } from "@/components/creators/discover-creators-client";

export const metadata: Metadata = {
  title: "Discover AI Creators | Vireon AI",
  description:
    "Find and follow AI creators making images, videos, and cinematic visual work on Vireon AI.",
  openGraph: {
    title: "Discover AI Creators | Vireon AI",
    description:
      "Follow AI creators and discover public AI-generated visual content.",
    type: "website"
  }
};

export default function CreatorsPage() {
  return <DiscoverCreatorsClient />;
}
