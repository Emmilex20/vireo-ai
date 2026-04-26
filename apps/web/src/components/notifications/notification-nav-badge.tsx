"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor?: {
    displayName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export function NotificationNavBadge() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  async function loadCount() {
    try {
      const res = await fetch("/api/notifications/count");
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch {}
  }

  async function loadPreview() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setItems((data.notifications ?? []).slice(0, 5));
    } catch {}
  }

  useEffect(() => {
    void loadCount();

    const interval = setInterval(() => {
      void loadCount();
    }, 30000);

    function handleVisibilityChange() {
      if (!document.hidden) {
        void loadCount();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadPreview();
      await loadCount();
    }
  }

  function messageFor(item: NotificationItem) {
    const actor = item.actor?.displayName || item.actor?.username || "Someone";

    if (item.type === "follow") return `${actor} followed you`;
    if (item.type === "like") return `${actor} liked your creation`;
    if (item.type === "save") return `${actor} saved your creation`;
    if (item.type === "comment") return `${actor} commented on your creation`;

    return `${actor} interacted with your work`;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
      >
        <Bell className="size-4" />
        Notifications

        {count > 0 ? (
          <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-full max-w-[360px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f19] shadow-2xl sm:w-[360px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-xs text-muted-foreground">{count} unread</p>
            </div>

            <a
              href="/notifications"
              className="text-xs text-primary hover:text-primary/80"
            >
              View all
            </a>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-white">
                No notifications yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                New activity will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto p-2">
              {items.map((item) => (
                <a
                  key={item.id}
                  href="/notifications"
                  className={`flex gap-3 rounded-[1rem] p-3 transition hover:bg-white/5 ${
                    item.read ? "bg-transparent" : "bg-primary/10"
                  }`}
                >
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {item.actor?.avatarUrl ? (
                      <img
                        src={item.actor.avatarUrl}
                        alt={item.actor.displayName || item.actor.username || "Actor"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-white">
                        {(item.actor?.displayName || item.actor?.username || "S")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-white">
                      {messageFor(item)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
