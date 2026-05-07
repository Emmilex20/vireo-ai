import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/a/",
        "/explore",
        "/creators",
        "/u/",
        "/pricing",
        "/templates",
        "/privacy-policy",
        "/terms-of-use",
        "/cookie-policy"
      ],
      disallow: [
        "/admin/",
        "/api/",
        "/billing/",
        "/assets/",
        "/studio/",
        "/video-projects/",
        "/following/",
        "/notifications/"
      ]
    },
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
