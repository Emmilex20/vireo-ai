"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AuditLog = {
  id: string;
  reference?: string | null;
  provider: string;
  eventType: string;
  status: "accepted" | "rejected" | "error";
  reason?: string | null;
  rawPayload?: unknown;
  createdAt: string;
};

type StatusFilter = "all" | "accepted" | "rejected" | "error";

export function PaymentAuditClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/payment-audit");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load audit logs");
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

    return logs.filter((log) => {
      const statusMatch =
        statusFilter === "all" || log.status === statusFilter;

      const searchMatch =
        !term ||
        log.reference?.toLowerCase().includes(term) ||
        log.provider.toLowerCase().includes(term) ||
        log.eventType.toLowerCase().includes(term) ||
        log.reason?.toLowerCase().includes(term);

      return statusMatch && searchMatch;
    });
  }, [logs, query, statusFilter]);

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
            Payment audit logs
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Filter payment events and inspect raw provider payloads.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, provider, event, or reason..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "accepted", "rejected", "error"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                  statusFilter === status
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {filteredLogs.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No logs found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another search or status filter.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[900px] overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr_1fr_auto] gap-3 border-b border-white/10 bg-black/30 px-4 py-3 text-xs font-medium text-muted-foreground">
              <span>Reference</span>
              <span>Provider</span>
              <span>Status</span>
              <span>Reason</span>
              <span>Date</span>
              <span>Payload</span>
            </div>

            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[1fr_1fr_1fr_1.2fr_1fr_auto] gap-3 border-b border-white/10 px-4 py-4 text-xs text-slate-300 last:border-b-0"
              >
                <span className="truncate">{log.reference || "N/A"}</span>
                <span>{log.provider}</span>
                <span
                  className={
                    log.status === "accepted"
                      ? "text-emerald-400"
                      : log.status === "rejected"
                        ? "text-red-400"
                        : "text-amber-400"
                  }
                >
                  {log.status}
                </span>
                <span className="truncate">{log.reason || "—"}</span>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:bg-white/10"
                >
                  View
                </button>
              </div>
            ))}
            </div>
          </div>
        )}
      </section>

      {selectedLog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0f19]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-sm font-semibold text-white">
                  Raw payment payload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedLog.reference || "No reference"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <pre className="max-h-[70vh] overflow-auto p-5 text-xs leading-6 text-slate-300">
              {JSON.stringify(selectedLog.rawPayload ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </main>
  );
}
