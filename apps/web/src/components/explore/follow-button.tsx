"use client"

import { useState } from "react"

type FollowButtonProps = {
  creatorId: string
  initialFollowing: boolean
}

export function FollowButton({
  creatorId,
  initialFollowing,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleToggleFollow() {
    if (loading) return

    setLoading(true)

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creatorId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to follow creator")
        setLoading(false)
        return
      }

      setFollowing(data.following)
    } catch {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggleFollow}
      disabled={loading}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        following
          ? "border-white/10 bg-white/5 text-white"
          : "border-primary/20 bg-primary/10 text-primary"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {loading ? "Please wait..." : following ? "Following" : "Follow"}
    </button>
  )
}
