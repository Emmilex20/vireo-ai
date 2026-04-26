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
  providerJobId?: string | null;
  refundedAt?: string | null;
  storageProvider?: string | null;
  storagePublicId?: string | null;
  storageStatus?: string | null;
  storageReason?: string | null;
  createdAt: string;
  user?: {
    email?: string | null;
    username?: string | null;
    displayName?: string | null;
  } | null;
};

type TypeFilter = "all" | "image" | "video";

export function AdminStuckJobsClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
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
        const res = await fetch("/api/admin/stuck-jobs");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load stuck jobs");
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

      return typeMatch && searchMatch;
    });
  }, [jobs, query, typeFilter]);

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
            Stuck jobs monitor
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review processing jobs older than 30 minutes and retry provider
            status checks manually.
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
            <p className="text-lg font-medium text-white">No stuck jobs found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Jobs older than 30 minutes in processing will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[900px] overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-[1fr_0.6fr_1fr_1fr_0.7fr_1fr] gap-3 border-b border-white/10 bg-black/30 px-4 py-3 text-xs font-medium text-muted-foreground">
              <span>Prompt</span>
              <span>Type</span>
              <span>Provider</span>
              <span>User</span>
              <span>Credits</span>
              <span>Date</span>
            </div>

            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="grid grid-cols-[1fr_0.6fr_1fr_1fr_0.7fr_1fr] gap-3 border-b border-white/10 px-4 py-4 text-xs text-slate-300 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-white">
                    {job.prompt || "No prompt"}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleRetry(job.id)}
                    className="mt-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/15"
                  >
                    Retry check
                  </button>
                </div>

                <span className="capitalize">{job.type}</span>

                <div className="min-w-0">
                  <p className="truncate">{job.providerName || "N/A"}</p>
                  <p className="mt-1 truncate text-muted-foreground">
                    {job.providerJobId || "No provider ID"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="truncate">
                    {job.user?.displayName ||
                      job.user?.username ||
                      job.user?.email ||
                      "Unknown"}
                  </p>
                </div>

                <span>{job.creditsUsed}</span>

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
