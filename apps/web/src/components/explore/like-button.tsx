"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

type LikeButtonProps = {
  postId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleToggleLike() {
    if (loading) return

    setLoading(true)

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      })

      const data = await res.json()

      if (!res.ok) {
        window.alert(data.error || "Failed to like post")
        setLoading(false)
        return
      }

      if (data.liked) {
        setLiked(true)
        setCount((prev) => prev + 1)
      } else {
        setLiked(false)
        setCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      window.alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
        liked
          ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
      <span>{count}</span>
    </button>
  )
}
