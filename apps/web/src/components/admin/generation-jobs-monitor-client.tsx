"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Job = {
  id: string;
  type: string;
  status: string;
  prompt?: string | null;
  failureReason?: string | null;
  creditsUsed: number;
  providerName?: string | null;
  fallbackProviderName?: string | null;
  providerJobId?: string | null;
  failoverReason?: string | null;
  failoverAt?: string | null;
  refundedAt?: string | null;
  storageProvider?: string | null;
  storagePublicId?: string | null;
  storageStatus?: string | null;
  storageReason?: string | null;
  queueAttempts?: number;
  lastCheckedAt?: string | null;
  queueLastError?: string | null;
  createdAt: string;
  user?: {
    email?: string | null;
    username?: string | null;
    displayName?: string | null;
  } | null;
};

type StatusFilter = "all" | "processing" | "completed" | "failed";
type TypeFilter = "all" | "image" | "video";

export function GenerationJobsMonitorClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [loading, setLoading] = useState(true);

  async function handleRetry(jobId: string) {
    const res = await fetch(`/api/admin/generation-jobs/${jobId}/retry`, {
      method: "POST"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to retry job");
      return;
    }

    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, ...data.job } : job))
    );
  }

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/admin/generation-jobs");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load generation jobs");
          return;
        }

        setJobs(data.jobs ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const term = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const statusMatch =
        statusFilter === "all" || job.status === statusFilter;

      const typeMatch = typeFilter === "all" || job.type === typeFilter;

      const searchMatch =
        !term ||
        job.id.toLowerCase().includes(term) ||
        job.prompt?.toLowerCase().includes(term) ||
        job.providerName?.toLowerCase().includes(term) ||
        job.providerJobId?.toLowerCase().includes(term) ||
        job.user?.email?.toLowerCase().includes(term) ||
        job.user?.username?.toLowerCase().includes(term) ||
        job.user?.displayName?.toLowerCase().includes(term);

      return statusMatch && typeMatch && searchMatch;
    });
  }, [jobs, query, statusFilter, typeFilter]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1300px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1300px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Admin
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Generation jobs monitor
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review recent image/video jobs, providers, failures, refunds, and
            users.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompt, provider, user, or job ID..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "processing", "completed", "failed"] as StatusFilter[]).map(
            (status) => (
              <FilterButton
                key={status}
                label={status}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              />
            )
          )}

          {(["all", "image", "video"] as TypeFilter[]).map((type) => (
            <FilterButton
              key={type}
              label={type}
              active={typeFilter === type}
              onClick={() => setTypeFilter(type)}
            />
          ))}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No jobs found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another search or filter.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[900px] overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-[1fr_0.6fr_0.8fr_1fr_1fr_0.7fr_1fr] gap-3 border-b border-white/10 bg-black/30 px-4 py-3 text-xs font-medium text-muted-foreground">
              <span>Prompt</span>
              <span>Type</span>
              <span>Status</span>
              <span>Provider</span>
              <span>User</span>
              <span>Credits</span>
              <span>Date</span>
            </div>

            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="grid grid-cols-[1fr_0.6fr_0.8fr_1fr_1fr_0.7fr_1fr] gap-3 border-b border-white/10 px-4 py-4 text-xs text-slate-300 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-white">
                    {job.prompt || "No prompt"}
                  </p>
                  {job.failureReason ? (
                    <p className="mt-1 truncate text-red-400">
                      {job.failureReason}
                    </p>
                  ) : null}
                </div>

                <span className="capitalize">{job.type}</span>

                <span
                  className={
                    job.status === "completed"
                      ? "text-emerald-400"
                      : job.status === "failed"
                        ? "text-red-400"
                        : "text-amber-400"
                  }
                >
                  {job.status}
                  {job.status === "processing" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleRetry(job.id)}
                        className="mt-2 block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/15"
                      >
                        Retry check
                      </button>
                      <p className="mt-1 truncate text-amber-400">
                        Still processing — worker will timeout after configured
                        max duration.
                      </p>
                    </>
                  ) : null}
                </span>

                <div className="min-w-0">
                  <p className="truncate">{job.providerName || "N/A"}</p>
                  <p className="mt-1 truncate text-muted-foreground">
                    {job.providerJobId || "No provider ID"}
                  </p>
                  {job.fallbackProviderName ? (
                    <p className="mt-1 truncate text-amber-400">
                      Fallback: {job.fallbackProviderName}
                    </p>
                  ) : null}
                  {job.failoverReason ? (
                    <p className="mt-1 truncate text-amber-400">
                      Failover reason: {job.failoverReason}
                    </p>
                  ) : null}
                  {job.failoverAt ? (
                    <p className="mt-1 truncate text-muted-foreground">
                      Failover at: {new Date(job.failoverAt).toLocaleString()}
                    </p>
                  ) : null}
                  <p className="mt-1 truncate text-muted-foreground">
                    Storage: {job.storageStatus || "unknown"}
                    {job.storageProvider ? ` | ${job.storageProvider}` : ""}
                  </p>
                  {job.storagePublicId ? (
                    <p className="mt-1 truncate text-muted-foreground">
                      Public ID: {job.storagePublicId}
                    </p>
                  ) : null}
                  {job.storageStatus === "fallback" && job.storageReason ? (
                    <p className="mt-1 truncate text-amber-400">
                      {job.storageReason}
                    </p>
                  ) : null}
                  <p className="mt-1 truncate text-muted-foreground">
                    Queue attempts: {job.queueAttempts ?? 0}
                  </p>
                  {job.lastCheckedAt ? (
                    <p className="mt-1 truncate text-muted-foreground">
                      Last checked:{" "}
                      {new Date(job.lastCheckedAt).toLocaleString()}
                    </p>
                  ) : null}
                  {job.queueLastError ? (
                    <p className="mt-1 truncate text-red-400">
                      Queue error: {job.queueLastError}
                    </p>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className="truncate">
                    {job.user?.displayName ||
                      job.user?.username ||
                      job.user?.email ||
                      "Unknown"}
                  </p>
                </div>

                <span>
                  {job.creditsUsed}
                  {job.refundedAt ? " refunded" : ""}
                </span>

                <span>{new Date(job.createdAt).toLocaleString()}</span>
              </div>
            ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function FilterButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
