import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPublicExploreFeed } from "@vireon/db";
import { unstable_noStore as noStore } from "next/cache";
import { inferMediaType } from "@/lib/media/infer-media-type";

import { ExploreCard } from "./explore-card";

type PublicPost = Awaited<ReturnType<typeof getPublicExploreFeed>>[number];

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[randomIndex] as T;
    copy[randomIndex] = current as T;
  }

  return copy;
}

function pickFeaturedPosts(posts: PublicPost[]) {
  const shuffled = shuffle(posts);
  const featured: PublicPost[] = [];
  const seenCreators = new Set<string>();

  for (const post of shuffled) {
    const creatorKey =
      post.user?.username || post.user?.displayName || `user-${post.userId}`;

    if (seenCreators.has(creatorKey)) {
      continue;
    }

    featured.push(post);
    seenCreators.add(creatorKey);

    if (featured.length === 4) {
      return featured;
    }
  }

  for (const post of shuffled) {
    if (featured.some((item) => item.id === post.id)) {
      continue;
    }

    featured.push(post);

    if (featured.length === 4) {
      break;
    }
  }

  return featured;
}

export async function ExploreFeed() {
  noStore();

  const posts = await getPublicExploreFeed();
  const featuredPosts = pickFeaturedPosts(posts);

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.18)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="size-3.5" />
            Community inspiration
          </div>
          <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            See what creators are actually building with Vireon.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
            This section now draws from real public posts that creators chose to
            publish, so new visitors see intentional work, not placeholder
            showcase cards.
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
        >
          View full explore
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featuredPosts.map((post) => (
          <ExploreCard
            key={post.id}
            title={
              post.caption ||
              post.asset.title ||
              post.asset.prompt ||
              "Published creation"
            }
            creator={post.user?.displayName || post.user?.username || "creator"}
            creatorUsername={post.user?.username || undefined}
            likes={post.likesCount ?? 0}
            views={`${post.commentsCount ?? 0} comments`}
            height="medium"
            mediaUrl={post.asset.fileUrl}
            mediaType={inferMediaType(post.asset)}
            href={`/a/${post.asset.id}`}
          />
        ))}
      </div>
    </section>
  );
}
