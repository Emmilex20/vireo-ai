"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user?: {
    displayName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export function AssetCommentsPanel({ assetId }: { assetId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/assets/comments?assetId=${assetId}`);
        const data = await res.json();
        setComments(data.comments ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadComments();
  }, [assetId]);

  async function handlePost() {
    if (body.trim().length < 2) return;

    setPosting(true);

    try {
      const res = await fetch("/api/assets/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId,
          body,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to post comment");
        return;
      }

      setComments((prev) => [data.comment, ...prev]);
      setBody("");
    } catch {
      alert("Something went wrong");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Comments</h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
          {comments.length}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
        />

        <button
          type="button"
          onClick={() => void handlePost()}
          disabled={posting || body.trim().length < 2}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/15 disabled:opacity-50"
        >
          <Send className="size-4" />
          {posting ? "Posting..." : "Post"}
        </button>
      </div>

      <div className="mt-5 max-h-64 space-y-3 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment.
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  {comment.user?.avatarUrl ? (
                    <img
                      src={comment.user.avatarUrl}
                      alt={comment.user.displayName || comment.user.username || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white">
                      {(comment.user?.displayName || comment.user?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white">
                    {comment.user?.displayName || comment.user?.username || "User"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {comment.body}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
