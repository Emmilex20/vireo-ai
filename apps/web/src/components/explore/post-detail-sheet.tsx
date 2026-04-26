"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { CommentComposer } from "./comment-composer"
import { CommentList } from "./comment-list"
import { LikeButton } from "./like-button"

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

type CommentItem = {
  id: string
  body: string
  createdAt: string
  user: {
    id: string
    fullName?: string | null
    username?: string | null
    avatarUrl?: string | null
  }
}

type PostDetailSheetProps = {
  post: ExplorePost
  open: boolean
  onClose: () => void
  onCommentAdded?: (postId: string) => void
}

export function PostDetailSheet({
  post,
  open,
  onClose,
  onCommentAdded,
}: PostDetailSheetProps) {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount)

  useEffect(() => {
    if (!open) return

    setCommentsCount(post.commentsCount)

    async function loadComments() {
      setLoadingComments(true)

      try {
        const res = await fetch(`/api/comments/${post.id}`)
        const data = await res.json()
        setComments(data.comments ?? [])
      } catch {
      } finally {
        setLoadingComments(false)
      }
    }

    loadComments()
  }, [open, post.id, post.commentsCount])

  function handleCommentAdded(comment: CommentItem) {
    setComments((prev) => [comment, ...prev])
    setCommentsCount((prev) => prev + 1)
    onCommentAdded?.(post.id)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#090909] shadow-2xl shadow-black/50">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/60 px-5 py-4 backdrop-blur-xl">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
              Post details
            </h2>
            <p className="text-xs text-muted-foreground">
              Creator interaction view
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-6 p-5">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
            <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
              <Image
                src={post.asset.fileUrl}
                alt={post.asset.title || "Published image"}
                fill
                sizes="(min-width: 768px) 48rem, 100vw"
                className="object-cover"
              />
            </div>

            <div className="p-5">
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
                  <p className="text-sm font-medium text-white">
                    {post.user.fullName || "Unknown creator"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{post.user.username || "creator"}
                  </p>
                </div>
              </div>

              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                {post.asset.title || "Published image"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {post.caption || post.asset.prompt || "No caption available"}
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-3">
                  <LikeButton
                    postId={post.id}
                    initialLiked={post.likedByCurrentUser}
                    initialCount={post.likesCount}
                  />

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white">
                    <MessageCircle className="size-3.5" />
                    <span>{commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CommentComposer
            postId={post.id}
            onCommentAdded={handleCommentAdded}
          />

          {loadingComments ? (
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-muted-foreground">
                Loading comments...
              </p>
            </div>
          ) : (
            <CommentList comments={comments} />
          )}
        </div>
      </div>
    </div>
  )
}