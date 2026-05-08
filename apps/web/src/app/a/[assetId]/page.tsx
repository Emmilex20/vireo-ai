/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicAssetDetail, getPublicAssets } from "@vireon/db";
import { PublicAssetShareActions } from "@/components/assets/public-asset-share-actions";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { inferMediaType } from "@/lib/media/infer-media-type";
import { SEO_KEYWORDS } from "@/lib/constants";
import { getImageLicenseMetadata } from "@/lib/image-license-metadata";
import { absoluteUrl, seoDescription } from "@/lib/seo";

type Props = {
  params: Promise<{ assetId: string }>;
};

async function loadPublicAsset(assetId: string) {
  try {
    const directMatch = await getPublicAssetDetail(assetId);
    if (directMatch) {
      return directMatch;
    }
  } catch (error) {
    console.error("Failed to load public asset detail directly", error);
  }

  try {
    const publicAssets = await getPublicAssets();
    return publicAssets.find((asset) => asset.id === assetId) ?? null;
  } catch (error) {
    console.error("Failed to load public assets fallback", error);
    return null;
  }
}

async function loadRelatedPublicAssets(
  currentAsset: NonNullable<Awaited<ReturnType<typeof loadPublicAsset>>>
) {
  try {
    const publicAssets = await getPublicAssets();
    const currentMediaType = inferMediaType(currentAsset);

    const related = publicAssets
      .filter((asset) => asset.id !== currentAsset.id)
      .map((asset) => ({
        ...asset,
        resolvedMediaType: inferMediaType(asset),
      }))
      .filter((asset) => asset.resolvedMediaType !== "audio")
      .sort((left, right) => {
        const leftSameCreator = left.userId === currentAsset.userId ? 1 : 0;
        const rightSameCreator = right.userId === currentAsset.userId ? 1 : 0;

        if (leftSameCreator !== rightSameCreator) {
          return rightSameCreator - leftSameCreator;
        }

        const leftSameMedia = left.resolvedMediaType === currentMediaType ? 1 : 0;
        const rightSameMedia =
          right.resolvedMediaType === currentMediaType ? 1 : 0;

        if (leftSameMedia !== rightSameMedia) {
          return rightSameMedia - leftSameMedia;
        }

        return (
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );
      })
      .slice(0, 3);

    return related;
  } catch (error) {
    console.error("Failed to load related public assets", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { assetId } = await params;
  const asset = await loadPublicAsset(assetId);

  if (!asset) {
    return {
      title: "Asset not found | Vireon AI"
    };
  }

  const title = asset.title || "AI creation";
  const mediaType = inferMediaType(asset);
  const description =
    seoDescription(
      asset.prompt,
      `View this AI-generated ${mediaType} made with Vireon AI.`
    );
  const canonicalUrl = absoluteUrl(`/a/${asset.id}`);
  const previewImage = asset.thumbnailUrl || (mediaType === "audio" ? "/logo.png" : asset.fileUrl);
  const mediaLabel =
    mediaType === "video" ? "AI video" : mediaType === "audio" ? "AI voice-over" : "AI image";

  return {
    title: `${title} - ${mediaLabel} | Vireon AI`,
    description,
    keywords: [
      ...SEO_KEYWORDS,
      mediaLabel,
      "AI creation",
      "AI creator portfolio",
      "AI prompt example"
    ],
    alternates: {
      canonical: canonicalUrl
    },
    robots:
      mediaType === "audio"
        ? {
            index: false,
            follow: true
          }
        : {
            index: true,
            follow: true
          },
    openGraph: {
      title: `${title} - ${mediaLabel} | Vireon AI`,
      description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${mediaLabel} | Vireon AI`,
      description,
      images: [previewImage]
    }
  };
}

export default async function PublicAssetPage({ params }: Props) {
  const { assetId } = await params;
  const asset = await loadPublicAsset(assetId);

  if (!asset) notFound();

  const mediaType = inferMediaType(asset);
  const isVideo = mediaType === "video";
  const isAudio = mediaType === "audio";
  const relatedAssets = await loadRelatedPublicAssets(asset);
  const canonicalUrl = absoluteUrl(`/a/${asset.id}`);
  const creatorName = asset.user?.displayName || asset.user?.username;
  const assetStructuredData = {
    "@context": "https://schema.org",
    "@type": isVideo ? "VideoObject" : isAudio ? "AudioObject" : "ImageObject",
    name: asset.title || "AI creation",
    description:
      asset.prompt || "AI-generated creation made with Vireon AI.",
    contentUrl: asset.fileUrl,
    thumbnailUrl:
      asset.thumbnailUrl || (isAudio ? absoluteUrl("/logo.png") : asset.fileUrl),
    uploadDate: asset.createdAt,
    creator: asset.user?.username
      ? {
          "@type": "Person",
          name: creatorName,
          url: absoluteUrl(`/u/${asset.user.username}`)
        }
      : undefined,
    ...(!isVideo && !isAudio ? getImageLicenseMetadata(creatorName) : {})
  };

  return (
    <PublicSiteFrame>
      <main className="mx-auto w-full max-w-275 px-4 py-8 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(assetStructuredData)
          }}
        />

        <section className="rounded-4xl border border-white/10 bg-white/5 p-6">
          <a href="/explore" className="text-sm text-primary">
            {"<- Back to explore"}
          </a>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30">
              {isAudio ? (
                <div className="flex min-h-96 flex-col items-center justify-center gap-6 p-6 text-center">
                  <div className="flex h-28 w-48 items-end justify-center gap-2 rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),rgba(236,72,153,0.14),rgba(255,255,255,0.04))] p-6">
                    {[42, 68, 96, 126, 92, 64, 44].map((height, index) => (
                      <span
                        key={index}
                        className="w-3 rounded-full bg-white/60"
                        style={{ height }}
                      />
                    ))}
                  </div>
                  <audio src={asset.fileUrl} controls className="w-full max-w-xl" />
                </div>
              ) : isVideo ? (
                <video
                  src={asset.fileUrl}
                  controls
                  playsInline
                  className="max-h-180 w-full object-contain"
                />
              ) : (
                <img
                  src={asset.fileUrl}
                  alt={asset.title || asset.prompt || "AI creation"}
                  className="max-h-180 w-full object-contain"
                />
              )}
            </div>

            <aside className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                Public creation
              </div>

              <h1 className="mt-4 font-heading text-3xl font-bold text-white">
                {asset.title || "Untitled creation"}
              </h1>

              {asset.prompt ? (
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {asset.prompt}
                </p>
              ) : null}

              {asset.user?.username ? (
                <>
                  <a
                    href={`/u/${asset.user.username}`}
                    className="mt-5 flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      {asset.user.avatarUrl ? (
                        <img
                          src={asset.user.avatarUrl}
                          alt={asset.user.displayName || asset.user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-white">
                          {(asset.user.displayName || asset.user.username)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {asset.user.displayName || asset.user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{asset.user.username}
                      </p>
                    </div>
                  </a>

                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    Discover more AI creations from this creator by visiting their profile.
                  </p>
                </>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {asset._count.likes} likes
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {asset._count.saves} saves
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {asset._count.comments} comments
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {isVideo ? "Video" : isAudio ? "Audio" : "Image"}
                </span>
              </div>

              <PublicAssetShareActions
                url={canonicalUrl}
                title={asset.title || "AI creation made with Vireon AI"}
              />

              <p className="mt-5 text-xs text-muted-foreground">
                Created {new Date(asset.createdAt).toLocaleString()}
              </p>
            </aside>
          </div>
        </section>

        {relatedAssets.length > 0 ? (
          <section className="mt-8 rounded-4xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                  Keep exploring
                </div>
                <h2 className="mt-4 font-heading text-2xl font-bold text-white">
                  Related creations
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  More public work from this creator and similar visual formats on Vireon AI.
                </p>
              </div>

              <a
                href="/explore"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Browse explore
              </a>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {relatedAssets.map((item) => {
                const itemIsVideo = item.resolvedMediaType === "video";

                return (
                  <a
                    key={item.id}
                    href={`/a/${item.id}`}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-black/20 transition hover:border-primary/20 hover:bg-white/4"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-black/30">
                      {itemIsVideo ? (
                        <video
                          src={item.fileUrl}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <img
                          src={item.fileUrl}
                          alt={item.title || item.prompt || "Related creation"}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                      )}

                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.7)_100%)]" />

                      <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                        {itemIsVideo ? "Video" : "Image"}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-2 font-heading text-lg font-semibold text-white">
                        {item.title || "Untitled creation"}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {item.prompt || "Published creation from the Vireon community."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                          {(item.user?.displayName || item.user?.username || "Creator")}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                          {item._count?.likes ?? 0} likes
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    </PublicSiteFrame>
  );
}
