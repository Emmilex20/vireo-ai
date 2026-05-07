"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CreditCard,
  FileText,
  ImageIcon,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

type AdminStats = {
  users: number;
  assets: number;
  publicAssets: number;
  generationJobs: number;
  failedJobs: number;
  payments: number;
  auditLogs: number;
};

export function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load admin dashboard");
          return;
        }

        setStats(data.stats);
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-300 px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-white/5" />
          ))}
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="mx-auto w-full max-w-225 px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">
          Your account is not allowed to view this dashboard.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-300 px-4 py-8 sm:px-6">
      <section className="rounded-4xl border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <LayoutDashboard className="size-3.5" />
            Admin
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold text-white">
            Admin dashboard
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor platform activity, payments, generations, and moderation
            surfaces.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard icon={<Users />} label="Users" value={stats.users} />
          <StatCard icon={<ImageIcon />} label="Assets" value={stats.assets} />
          <StatCard
            icon={<ImageIcon />}
            label="Public assets"
            value={stats.publicAssets}
          />
          <StatCard
            icon={<FileText />}
            label="Generation jobs"
            value={stats.generationJobs}
          />
          <StatCard
            icon={<AlertTriangle />}
            label="Failed jobs"
            value={stats.failedJobs}
            danger
          />
          <StatCard
            icon={<CreditCard />}
            label="Payments"
            value={stats.payments}
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <AdminLink
            href="/admin/users"
            title="Users"
            description="Review users, credits, generation counts, payments, and public activity."
          />
          <AdminLink
            href="/admin/generation-jobs"
            title="Generation jobs"
            description="Monitor image/video jobs, failures, providers, and refunds."
          />
          <AdminLink
            href="/admin/templates"
            title="Templates"
            description="Curate completed generations into reusable public image and video templates."
          />
          <AdminLink
            href="/admin/homepage"
            title="Homepage media"
            description="Choose the images and videos displayed in hero cards, suite cards, models, and inspirations."
          />
          <AdminLink
            href="/admin/stuck-jobs"
            title="Stuck jobs"
            description="Review processing jobs and manually retry provider status checks."
          />
          <AdminLink
            href="/admin/payment-audit"
            title="Payment audit logs"
            description={`${stats.auditLogs} payment audit events recorded.`}
          />
          <AdminLink
            href="/admin/credit-audit"
            title="Credit adjustment audit"
            description="Review manual admin credit additions and removals."
          />
          <AdminLink
            href="/admin/moderation"
            title="Public asset moderation"
            description="Review and unpublish public images/videos from discovery surfaces."
          />
          <AdminLink
            href="/admin/moderation-audit"
            title="Moderation audit"
            description="Review unpublish actions, admin notes, affected assets, and creators."
          />
          <AdminLink
            href="/admin/providers"
            title="AI providers"
            description="Check provider environment readiness before enabling real generation."
          />
          <AdminLink
            href="/admin/background-mode"
            title="Background mode"
            description="Switch between inline beta mode and full worker mode when you are ready."
          />
          <AdminLink
            href="/admin/subscriptions"
            title="Subscriptions"
            description="Monitor active subscribers, renewals, cancellations, and recurring credit grants."
          />
          <AdminLink
            href="/admin/analytics"
            title="Analytics"
            description="View usage metrics, credits consumption, and revenue signals."
          />
          <AdminLink
            href="/billing"
            title="Billing overview"
            description="Review user-facing billing flows and credit movement."
          />
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className={danger ? "text-red-400" : "text-primary"}>{icon}</div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function AdminLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:bg-white/5"
    >
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}
