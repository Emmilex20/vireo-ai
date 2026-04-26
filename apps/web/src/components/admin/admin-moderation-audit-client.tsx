"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ModerationLog = {
  id: string;
  assetId: string;
  adminId: string;
  action: string;
  note?: string | null;
  createdAt: string;
  asset?: {
    title?: string | null;
    prompt?: string | null;
    fileUrl?: string | null;
    user?: {
      email?: string | null;
      username?: string | null;
      displayName?: string | null;
    } | null;
  } | null;
};

export function AdminModerationAuditClient() {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/moderation/audit");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load moderation audit logs");
          return;
        }

        setLogs(data.logs ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return logs;

    return logs.filter((log) => {
      return (
        log.assetId.toLowerCase().includes(term) ||
        log.adminId.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.note?.toLowerCase().includes(term) ||
        log.asset?.title?.toLowerCase().includes(term) ||
        log.asset?.prompt?.toLowerCase().includes(term) ||
        log.asset?.user?.email?.toLowerCase().includes(term) ||
        log.asset?.user?.username?.toLowerCase().includes(term) ||
        log.asset?.user?.displayName?.toLowerCase().includes(term)
      );
    });
  }, [logs, query]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Admin
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Moderation audit logs
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review public asset moderation actions, admin IDs, notes, and
            affected creators.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search admin, creator, note, prompt, or asset ID..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filteredLogs.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">
              No moderation logs found
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {filteredLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {log.action} · {log.asset?.title || "Untitled asset"}
                    </p>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {log.asset?.prompt || "No prompt stored"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        Admin: {log.adminId}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        Asset: {log.assetId}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        Creator:{" "}
                        {log.asset?.user?.displayName ||
                          log.asset?.user?.username ||
                          log.asset?.user?.email ||
                          "Unknown"}
                      </span>
                    </div>

                    {log.note ? (
                      <div className="mt-3 rounded-[1rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-300">
                        {log.note}
                      </div>
                    ) : null}

                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {log.asset?.fileUrl ? (
                    <div className="h-24 w-32 overflow-hidden rounded-[1rem] border border-white/10 bg-black/30">
                      <img
                        src={log.asset.fileUrl}
                        alt={log.asset.title || "Moderated asset"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
