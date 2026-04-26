"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { ExploreFeedTabs } from "./explore-feed-tabs"
import { LikeButton } from "./like-button"
import { PostDetailSheet } from "./post-detail-sheet"

type ExplorePost = {
  id: string
  caption?: string | null
  createdAt: string
  likesCount: number
  commentsCount: number
  likedByCurrentUser: boolean
  asset: {
    id: string
    title?: string | null
    prompt?: string | null
    fileUrl: string
  }
  user: {
    id: string
    fullName?: string | null
    username?: string | null
    avatarUrl?: string | null
  }
}

export function InternalExploreClient() {
  const [posts, setPosts] = useState<ExplorePost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<ExplorePost | null>(null)
  const [activeTab, setActiveTab] = useState<"recommended" | "following">(
    "recommended"
  )

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch(`/api/explore?tab=${activeTab}`)
        const data = await res.json()
        setPosts(data.posts ?? [])
      } catch {
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [activeTab])

  function handleTabChange(tab: "recommended" | "following") {
    if (tab === activeTab) return

    setLoading(true)
    setSelectedPost(null)
    setActiveTab(tab)
  }

  function handleCommentAdded(postId: string) {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      )
    )
    setSelectedPost((post) =>
      post && post.id === postId
        ? { ...post, commentsCount: post.commentsCount + 1 }
        : post
    )
  }

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="h-8 w-40 rounded bg-white/10" />
        <div className="mt-3 h-4 w-72 rounded bg-white/10" />
        <div className="mt-6 flex gap-3">
          <div className="h-10 w-28 rounded-full bg-white/10" />
          <div className="h-10 w-24 rounded-full bg-white/10" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 rounded-[1.5rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          Explore
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover publicly published creations from the Vireon AI platform.
        </p>

        <ExploreFeedTabs activeTab={activeTab} onChange={handleTabChange} />

        {posts.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">
              {activeTab === "following"
                ? "No posts from followed creators yet"
                : "No public posts yet"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === "following"
                ? "Follow creators to build your following feed."
                : "Publish an asset from your library and it will appear here."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                    <Image
                      src={post.asset.fileUrl}
                      alt={post.asset.title || "Published image"}
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition duration-300 hover:scale-[1.02]"
                    />
                  </div>
                </button>

                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs text-white">
                      {post.user.avatarUrl ? (
                        <div
                          aria-label={post.user.fullName || "Creator"}
                          className="h-full w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${post.user.avatarUrl})`,
                          }}
                        />
                      ) : (
                        <span>
                          {(post.user.fullName || "U").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/creator/${post.user.id}`}
                        className="text-sm font-medium text-white transition hover:text-primary"
                      >
                        {post.user.fullName || "Unknown creator"}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        @{post.user.username || "creator"}
                      </p>
                    </div>
                  </div>

                  <h2 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                    {post.asset.title || "Published image"}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {post.caption || post.asset.prompt || "No caption available"}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <LikeButton
                        postId={post.id}
                        initialLiked={post.likedByCurrentUser}
                        initialCount={post.likesCount}
                      />

                      <button
                        type="button"
                        onClick={() => setSelectedPost(post)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>{post.commentsCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedPost ? (
        <PostDetailSheet
          post={selectedPost}
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onCommentAdded={handleCommentAdded}
        />
      ) : null}
    </>
  )
}
