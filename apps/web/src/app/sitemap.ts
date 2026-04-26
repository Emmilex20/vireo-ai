import type { MetadataRoute } from "next";
import { db } from "@vireon/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const creators = await db.user.findMany({
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
  });

  const assets = await db.asset.findMany({
    where: {
      isPublic: true
    },
    select: {
      id: true,
      updatedAt: true,
      createdAt: true
    },
    take: 5000
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${APP_URL}/gallery`,
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
    }
  ];

  const creatorPages: MetadataRoute.Sitemap = creators
    .filter((creator) => creator.username)
    .map((creator) => ({
      url: `${APP_URL}/u/${creator.username}`,
      lastModified: creator.updatedAt ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7
    }));

  const assetPages: MetadataRoute.Sitemap = assets.map((asset) => ({
    url: `${APP_URL}/a/${asset.id}`,
    lastModified: asset.updatedAt ?? asset.createdAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticPages, ...creatorPages, ...assetPages];
}
