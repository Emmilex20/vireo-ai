import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getvireonai.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/explore", "/creators", "/u/", "/pricing", "/templates", "/privacy-policy", "/terms-of-use", "/cookie-policy"],
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
    sitemap: `${APP_URL}/sitemap.xml`
  };
}
