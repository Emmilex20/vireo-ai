import type { MetadataRoute } from "next";
import { db } from "@vireon/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getvireonai.com";

type SitemapCreator = {
  username: string | null;
  updatedAt: Date;
};

type SitemapAsset = {
  id: string;
  updatedAt: Date;
  createdAt: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${APP_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9
    },
    {
      url: `${APP_URL}/creators`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${APP_URL}/templates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${APP_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: `${APP_URL}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: `${APP_URL}/cookie-policy`,
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
          isPublic: true
        },
        select: {
          id: true,
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
      url: `${APP_URL}/u/${creator.username}`,
      lastModified: creator.updatedAt ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7
    }));

  const assetPages: MetadataRoute.Sitemap = assets.map((asset: SitemapAsset) => ({
    url: `${APP_URL}/a/${asset.id}`,
    lastModified: asset.updatedAt ?? asset.createdAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticPages, ...creatorPages, ...assetPages];
}
