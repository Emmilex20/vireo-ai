import type { MetadataRoute } from "next";
import { db } from "@vireon/db";
import { absoluteUrl } from "@/lib/seo";

type SitemapCreator = {
  username: string | null;
  updatedAt: Date;
};

type SitemapAsset = {
  id: string;
  title: string | null;
  prompt: string | null;
  mediaType: string;
  updatedAt: Date;
  createdAt: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/explore"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9
    },
    {
      url: absoluteUrl("/creators"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: absoluteUrl("/pricing"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: absoluteUrl("/templates"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: absoluteUrl("/privacy-policy"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: absoluteUrl("/terms-of-use"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: absoluteUrl("/cookie-policy"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3
    }
  ];

  let creators: SitemapCreator[] = [];
  let assets: SitemapAsset[] = [];

  try {
    [creators, assets] = await Promise.all([
      db.user.findMany({
        where: {
          username: {
            not: null
          }
        },
        select: {
          username: true,
          updatedAt: true
        },
        take: 5000
      }),
      db.asset.findMany({
        where: {
          isPublic: true,
          mediaType: {
            in: ["image", "video"]
          },
          OR: [
            {
              title: {
                not: null
              }
            },
            {
              prompt: {
                not: null
              }
            }
          ]
        },
        select: {
          id: true,
          title: true,
          prompt: true,
          mediaType: true,
          updatedAt: true,
          createdAt: true
        },
        take: 5000
      })
    ]);
  } catch (error) {
    console.warn("Failed to build dynamic sitemap entries", error);
  }

  const creatorPages: MetadataRoute.Sitemap = creators
    .filter((creator: SitemapCreator) => Boolean(creator.username))
    .map((creator: SitemapCreator) => ({
      url: absoluteUrl(`/u/${creator.username}`),
      lastModified: creator.updatedAt ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7
    }));

  const assetPages: MetadataRoute.Sitemap = assets
    .filter((asset: SitemapAsset) => Boolean(asset.title || asset.prompt))
    .map((asset: SitemapAsset) => ({
      url: absoluteUrl(`/a/${asset.id}`),
      lastModified: asset.updatedAt ?? asset.createdAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: asset.mediaType === "video" ? 0.68 : 0.62
    }));

  return [...staticPages, ...creatorPages, ...assetPages];
}
