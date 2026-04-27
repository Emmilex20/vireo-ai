import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicAssetDetail } from "@vireon/db";
import { PublicAssetShareActions } from "@/components/assets/public-asset-share-actions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

type Props = {
  params: Promise<{ assetId: string }>;
};

async function loadPublicAsset(assetId: string) {
  try {
    return await getPublicAssetDetail(assetId);
  } catch {
    return null;
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
  const description =
    asset.prompt?.slice(0, 155) ||
    "View this AI-generated image or video on Vireon AI.";

  return {
    title: `${title} | Vireon AI`,
    description,
    openGraph: {
      title: `${title} | Vireon AI`,
      description,
      url: `${APP_URL}/a/${asset.id}`,
      type: "article",
      images: [
        {
          url: asset.fileUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vireon AI`,
      description,
      images: [asset.fileUrl]
    }
  };
}

export default async function PublicAssetPage({ params }: Props) {
  const { assetId } = await params;
  const asset = await loadPublicAsset(assetId);

  if (!asset) notFound();

  const isVideo =
    asset.mediaType === "video" || asset.generationJob?.type === "video";

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": isVideo ? "VideoObject" : "ImageObject",
            name: asset.title || "AI creation",
            description:
              asset.prompt || "AI-generated creation made with Vireon AI.",
            contentUrl: asset.fileUrl,
            thumbnailUrl: asset.fileUrl,
            uploadDate: asset.createdAt,
            creator: asset.user?.username
              ? {
                  "@type": "Person",
                  name: asset.user.displayName || asset.user.username,
                  url: `${APP_URL}/u/${asset.user.username}`
                }
              : undefined
          })
        }}
      />

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <a href="/explore" className="text-sm text-primary">
          {"<- Back to explore"}
        </a>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30">
            {isVideo ? (
              <video
                src={asset.fileUrl}
                controls
                playsInline
                className="max-h-[720px] w-full object-contain"
              />
            ) : (
              <img
                src={asset.fileUrl}
                alt={asset.title || asset.prompt || "AI creation"}
                className="max-h-[720px] w-full object-contain"
              />
            )}
          </div>

          <aside className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Public creation
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
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
                {isVideo ? "Video" : "Image"}
              </span>
            </div>

            <PublicAssetShareActions
              url={`${APP_URL}/a/${asset.id}`}
              title={asset.title || "AI creation made with Vireon AI"}
            />

            <p className="mt-5 text-xs text-muted-foreground">
              Created {new Date(asset.createdAt).toLocaleString()}
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
