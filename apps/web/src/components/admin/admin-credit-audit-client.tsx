"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Adjustment = {
  id: string;
  amount: number;
  description?: string | null;
  adminId?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email?: string | null;
    username?: string | null;
    displayName?: string | null;
  } | null;
};

export function AdminCreditAuditClient() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdjustments() {
      try {
        const res = await fetch("/api/admin/credit-audit");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load credit audit");
          return;
        }

        setAdjustments(data.adjustments ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadAdjustments();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return adjustments;

    return adjustments.filter((item) => {
      return (
        item.description?.toLowerCase().includes(term) ||
        item.adminId?.toLowerCase().includes(term) ||
        item.user?.id.toLowerCase().includes(term) ||
        item.user?.email?.toLowerCase().includes(term) ||
        item.user?.username?.toLowerCase().includes(term) ||
        item.user?.displayName?.toLowerCase().includes(term)
      );
    });
  }, [adjustments, query]);

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
            Credit adjustment audit
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review manual credit additions and removals made by admins.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, admin ID, or reason..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">
              No adjustments found
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[900px] overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-[1.2fr_0.7fr_1fr_1.2fr_1fr] gap-3 border-b border-white/10 bg-black/30 px-4 py-3 text-xs font-medium text-muted-foreground">
              <span>User</span>
              <span>Amount</span>
              <span>Admin</span>
              <span>Reason</span>
              <span>Date</span>
            </div>

            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.2fr_0.7fr_1fr_1.2fr_1fr] gap-3 border-b border-white/10 px-4 py-4 text-xs text-slate-300 last:border-b-0"
              >
                <span className="truncate">
                  {item.user?.displayName ||
                    item.user?.username ||
                    item.user?.email ||
                    item.user?.id ||
                    "Unknown"}
                </span>

                <span
                  className={
                    item.amount > 0 ? "text-emerald-400" : "text-red-400"
                  }
                >
                  {item.amount > 0 ? "+" : ""}
                  {item.amount}
                </span>

                <span className="truncate">{item.adminId || "Unknown"}</span>

                <span className="truncate">{item.description || "—"}</span>

                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
