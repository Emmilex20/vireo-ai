import type { Metadata } from "next";
import { MobileHomeExperience } from "@/components/home/mobile-home-experience";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { SEO_KEYWORDS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Vireon AI - AI Image Generator, AI Video Generator & Creator Studio",
  description:
    "Create AI images, generate AI videos, animate images into motion, and build multi-scene visual projects with Vireon AI. Explore GPT Image, Kling, Veo, Flux, Recraft, Seedance, and more creator workflows.",
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Vireon AI - AI Image Generator, AI Video Generator & Creator Studio",
    description:
      "Generate images, videos, cinematic motion, and multi-scene AI stories from prompts with Vireon AI.",
    type: "website",
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: "Vireon AI - AI Image & Video Generator",
    description:
      "Create AI images, AI videos, image-to-video clips, and multi-scene projects with Vireon AI."
  }
};

export default function HomePage() {
  return (
    <PublicSiteFrame
      showMobileDock
      headerClassName="lg:hidden"
      contentClassName="pt-16 lg:pt-0"
      footerClassName="lg:pl-58"
    >
      <main className="relative min-h-screen overflow-x-hidden pb-[110px] lg:overflow-hidden lg:pb-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-130 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_45%),radial-gradient(circle_at_15%_22%,rgba(20,184,166,0.1),transparent_28%)]" />
        <div className="pointer-events-none absolute right-0 top-112 h-96 w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.09),transparent_62%)] blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1560px] px-4 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
          <MobileHomeExperience />
        </div>
      </main>
    </PublicSiteFrame>
  );
}
