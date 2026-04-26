"use client";

import { useEffect, useState } from "react";

type Analytics = {
  totalUsers: number;
  activeUsers: number;
  creditsUsed: number;
  imageJobs: number;
  videoJobs: number;
  exports: number;
  revenueCredits: number;
};

export function AdminAnalyticsClient() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    void fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <main className="mx-auto max-w-[1000px] px-4 py-8">
        <div className="h-10 w-64 rounded bg-white/10" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold text-white">
          Analytics Dashboard
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total users" value={data.totalUsers} />
          <Stat label="Active (7d)" value={data.activeUsers} />
          <Stat label="Credits used" value={data.creditsUsed} />
          <Stat label="Revenue (credits)" value={data.revenueCredits} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Image jobs" value={data.imageJobs} />
          <Stat label="Video jobs" value={data.videoJobs} />
          <Stat label="Exports" value={data.exports} />
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
