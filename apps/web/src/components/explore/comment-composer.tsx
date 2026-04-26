"use client"

import { useState } from "react"

type CommentComposerProps = {
  postId: string
  onCommentAdded: (comment: {
    id: string
    body: string
    createdAt: string
    user: {
      id: string
      fullName?: string | null
      username?: string | null
      avatarUrl?: string | null
    }
  }) => void
}

export function CommentComposer({
  postId,
  onCommentAdded,
}: CommentComposerProps) {
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    const value = body.trim()
    if (!value) return

    setSubmitting(true)

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          body: value,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        window.alert(data.error || "Failed to add comment")
        setSubmitting(false)
        return
      }

      onCommentAdded(data.comment)
      setBody("")
    } catch {
      window.alert("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment..."
        className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !body.trim()}
          className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </div>
    </div>
  )
}