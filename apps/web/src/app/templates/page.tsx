import type { Metadata } from "next";
import { Suspense } from "react";

import { TemplatesGalleryClient } from "@/components/templates/templates-gallery-client";
import { SEO_KEYWORDS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Prompt Templates for Images, Videos & Ads | Vireon AI",
  description:
    "Browse reusable AI prompt templates for cinematic images, AI videos, product ads, fashion editorials, characters, travel posters, and creator workflows.",
  keywords: [
    ...SEO_KEYWORDS,
    "AI prompt templates",
    "AI video prompt templates",
    "AI image prompt templates",
    "cinematic AI prompts",
    "product ad AI prompts",
    "fashion AI prompts"
  ],
  alternates: {
    canonical: absoluteUrl("/templates")
  },
  openGraph: {
    title: "AI Prompt Templates for Images, Videos & Ads | Vireon AI",
    description:
      "Recreate premium AI images and videos with reusable prompt templates for cinematic, product, fashion, character, and marketing workflows.",
    type: "website",
    url: absoluteUrl("/templates")
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Templates | Vireon AI",
    description:
      "Browse and recreate AI image and video prompt templates for polished creator work."
  }
};

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050606] px-4 py-8 text-white">
          <div className="h-10 w-72 rounded bg-white/10" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-64 rounded-3xl bg-white/5" />
            ))}
          </div>
        </main>
      }
    >
      <TemplatesGalleryClient />
    </Suspense>
  );
}
