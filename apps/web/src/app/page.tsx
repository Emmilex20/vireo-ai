import type { Metadata } from "next";
import { ImageToVideoWorkflowCard } from "@/components/dashboard/image-to-video-workflow-card";
import { RecentImageToVideoPanel } from "@/components/dashboard/recent-image-to-video-panel";
import { LandingConversionSection } from "@/components/home/landing-conversion-section";
import { PageShell } from "@/components/layout/page-shell";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { ExploreFeed } from "@/components/marketing/explore-feed";
import { HomeHero } from "@/components/marketing/home-hero";
import { QuickTools } from "@/components/marketing/quick-tools";

export const metadata: Metadata = {
  title: "Vireon AI - AI Image, Video, and Multi-Scene Creation",
  description:
    "Create AI images, animate them into videos, and build multi-scene AI video projects with Vireon AI.",
  openGraph: {
    title: "Vireon AI - AI Image, Video, and Multi-Scene Creation",
    description:
      "Generate images, videos, and multi-scene AI stories from prompts.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Vireon AI",
    description:
      "Create AI images, videos, and multi-scene projects with Vireon AI."
  }
};

export default function HomePage() {
  return (
    <PublicSiteFrame showMobileDock>
      <PageShell className="relative overflow-hidden py-5 pb-28 sm:py-8 md:pb-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_45%),radial-gradient(circle_at_15%_22%,rgba(20,184,166,0.1),transparent_28%)]" />
        <div className="pointer-events-none absolute right-0 top-[28rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.09),transparent_62%)] blur-3xl" />

        <div className="relative space-y-8 sm:space-y-10 lg:space-y-12">
          <HomeHero />
          <LandingConversionSection />
          <QuickTools />
          <ImageToVideoWorkflowCard />
          <RecentImageToVideoPanel />
          <ExploreFeed />
        </div>
      </PageShell>
    </PublicSiteFrame>
  );
}
