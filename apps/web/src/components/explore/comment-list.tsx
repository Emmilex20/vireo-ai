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

type CommentListProps = {
  comments: CommentItem[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-black/20 p-6 text-center">
        <p className="text-sm font-medium text-white">No comments yet</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Start the conversation on this creation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs text-white">
              {comment.user.avatarUrl ? (
                <div
                  aria-label={comment.user.fullName || "User"}
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${comment.user.avatarUrl})`,
                  }}
                />
              ) : (
                <span>
                  {(comment.user.fullName || "U").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                {comment.user.fullName || "Unknown user"}
              </p>
              <p className="text-xs text-muted-foreground">
                @{comment.user.username || "creator"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-200">{comment.body}</p>

          <div className="mt-3 text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </article>
      ))}
    </div>
  )
}