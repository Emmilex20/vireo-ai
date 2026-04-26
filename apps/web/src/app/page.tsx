import type { Metadata } from "next";
import { ImageToVideoWorkflowCard } from "@/components/dashboard/image-to-video-workflow-card";
import { RecentImageToVideoPanel } from "@/components/dashboard/recent-image-to-video-panel";
import { LandingConversionSection } from "@/components/home/landing-conversion-section";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryPills } from "@/components/marketing/category-pills";
import { ExploreFeed } from "@/components/marketing/explore-feed";
import { HomeHero } from "@/components/marketing/home-hero";
import { QuickTools } from "@/components/marketing/quick-tools";
import { TopTabs } from "@/components/marketing/top-tabs";

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
    <>
      <SiteHeader />

      <PageShell className="py-6 sm:py-8">
        <HomeHero />
        <LandingConversionSection />
        <ImageToVideoWorkflowCard />
        <RecentImageToVideoPanel />
        <QuickTools />
        <TopTabs />
        <CategoryPills />
        <ExploreFeed />
      </PageShell>

      <MobileBottomNav />
    </>
  );
}
