"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor?: {
    displayName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
  asset?: {
    id: string;
    title?: string | null;
    fileUrl: string;
    type?: string | null;
    mimeType?: string | null;
  } | null;
};

export function NotificationsPageClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  async function handleMarkRead() {
    setMarking(true);

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, read: true }))
        );
      }
    } finally {
      setMarking(false);
    }
  }

  function messageFor(item: Notification) {
    const actor = item.actor?.displayName || item.actor?.username || "Someone";

    if (item.type === "follow") return `${actor} followed you.`;
    if (item.type === "like") return `${actor} liked your creation.`;
    if (item.type === "save") return `${actor} saved your creation.`;
    if (item.type === "comment") return `${actor} commented on your creation.`;

    return `${actor} interacted with your work.`;
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-[1.5rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Bell className="size-3.5" />
              Notifications
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
              Activity on your creations
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
            </p>
          </div>

          <Button
            onClick={handleMarkRead}
            disabled={marking || unreadCount === 0}
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <CheckCheck className="mr-2 size-4" />
            {marking ? "Marking..." : "Mark all read"}
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No notifications yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Follows, likes, and saves on your creations will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {notifications.map((item) => {
              const isVideoAsset =
                item.asset?.type === "video" ||
                item.asset?.mimeType?.startsWith("video/") ||
                item.asset?.fileUrl?.toLowerCase().endsWith(".mp4");

              return (
                <article
                  key={item.id}
                  className={`rounded-[1.5rem] border p-4 ${
                    item.read
                      ? "border-white/10 bg-black/20"
                      : "border-primary/20 bg-primary/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      {item.actor?.avatarUrl ? (
                        <img
                          src={item.actor.avatarUrl}
                          alt={item.actor.displayName || item.actor.username || "Actor"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-white">
                          {(item.actor?.displayName || item.actor?.username || "S")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {messageFor(item)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {item.asset?.fileUrl ? (
                      <div className="size-14 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                        {isVideoAsset ? (
                          <video
                            src={item.asset.fileUrl}
                            muted
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.asset.fileUrl}
                            alt={item.asset.title || "Asset"}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
