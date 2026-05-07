import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingPageClient } from "@/components/billing/pricing-page-client";
import { AppShell } from "@/components/layout/app-shell";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing for AI Image, Video & Voice Generation | Vireon AI",
  description:
    "Compare Vireon AI plans and credits for AI image generation, video generation, voice-over tools, prompt templates, and creator workflows.",
  alternates: {
    canonical: absoluteUrl("/pricing")
  },
  openGraph: {
    title: "Pricing for AI Image, Video & Voice Generation | Vireon AI",
    description:
      "Choose a Vireon AI plan for generating images, videos, characters, voice-overs, and cinematic creator projects.",
    type: "website",
    url: absoluteUrl("/pricing")
  }
};

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <AppShell>
        <PricingPageClient />
      </AppShell>
    </Suspense>
  );
}
