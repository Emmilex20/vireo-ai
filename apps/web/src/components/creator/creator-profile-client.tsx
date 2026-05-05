"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FollowButton } from "@/components/explore/follow-button"

type CreatorPost = {
  id: string
  caption?: string | null
  createdAt: string
  asset: {
    id: string
    title?: string | null
    prompt?: string | null
    fileUrl: string
  }
}

type Creator = {
  id: string
  fullName?: string | null
  username?: string | null
  avatarUrl?: string | null
  createdAt: string
  profile?: {
    bio?: string | null
    website?: string | null
    location?: string | null
  } | null
  posts: CreatorPost[]
  isFollowing: boolean
  _count: {
    followers: number
    following: number
    posts: number
  }
}

type CreatorProfileClientProps = {
  creatorId: string
}

export function CreatorProfileClient({
  creatorId,
}: CreatorProfileClientProps) {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCreator() {
      try {
        const res = await fetch(`/api/creators/${creatorId}`)
        const data = await res.json()

        if (res.ok) {
          setCreator(data.creator)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    loadCreator()
  }, [creatorId])

  if (loading) {
    return (
      <section className="rounded-4xl border border-white/10 bg-white/5 p-6">
        <div className="h-24 w-24 rounded-full bg-white/10" />
        <div className="mt-4 h-8 w-56 rounded bg-white/10" />
        <div className="mt-3 h-4 w-72 rounded bg-white/10" />
      </section>
    )
  }

  if (!creator) {
    return (
      <section className="rounded-4xl border border-white/10 bg-white/5 p-10 text-center">
        <h1 className="font-heading text-2xl font-bold text-white">
          Creator not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          The creator profile you are looking for does not exist.
        </p>
      </section>
    )
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-4xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-white/10 text-2xl text-white">
              {creator.avatarUrl ? (
                <div
                  aria-label={creator.fullName || "Creator"}
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${creator.avatarUrl})`,
                  }}
                />
              ) : (
                <span>
                  {(creator.fullName || "U").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h1 className="font-heading text-3xl font-bold text-white">
                {creator.fullName || "Unknown creator"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                @{creator.username || "creator"}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                {creator.profile?.bio || "This creator has not added a bio yet."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {creator.profile?.location ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {creator.profile.location}
                  </span>
                ) : null}

                {creator.profile?.website ? (
                  <a
                    href={creator.profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
                  >
                    {creator.profile.website}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <FollowButton
            creatorId={creator.id}
            initialFollowing={creator.isFollowing}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-muted-foreground">Followers</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {creator._count.followers}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-muted-foreground">Following</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {creator._count.following}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-muted-foreground">Public posts</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {creator._count.posts}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-heading text-2xl font-bold text-white">
          Public creations
        </h2>
        <p className="mt-2 text-muted-foreground">
          Explore the published visual work from this creator.
        </p>

        {creator.posts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No public posts yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This creator has not published anything yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creator.posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-black/20">
                  <Image
                    src={post.asset.fileUrl}
                    alt={post.asset.title || "Creator asset"}
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {post.asset.title || "Published image"}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {post.caption || post.asset.prompt || "No caption available"}
                  </p>

                  <div className="mt-4 text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div>
        <Link
          href="/explore"
          className="text-sm text-primary transition hover:text-primary/80"
        >
          Back to explore
        </Link>
      </div>
    </div>
  )
}
