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
        "/sign-in/",
        "/sign-up/",
        "/billing/",
        "/assets/",
        "/studio/",
        "/video-projects/",
        "/following/",
        "/notifications/"
      ]
    },
    host: absoluteUrl("/"),
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
