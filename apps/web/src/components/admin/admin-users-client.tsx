"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  username?: string | null;
  createdAt: string;
  wallet?: {
    balance: number;
  } | null;
  _count?: {
    assets: number;
    jobs: number;
    payments: number;
    followers: number;
    following: number;
  };
};

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load users");
          return;
        }

        setUsers(data.users ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      return (
        user.id.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.displayName?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term)
      );
    });
  }, [users, query]);

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
            User management
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review users, credits, payments, generations, and public activity.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user ID, email, username, or display name..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-medium text-white">No users found</p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[900px] overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_0.6fr_0.6fr_1fr_auto] gap-3 border-b border-white/10 bg-black/30 px-4 py-3 text-xs font-medium text-muted-foreground">
              <span>User</span>
              <span>Username</span>
              <span>Credits</span>
              <span>Assets</span>
              <span>Jobs</span>
              <span>Payments</span>
              <span>Joined</span>
              <span>Detail</span>
            </div>

            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_0.6fr_0.6fr_1fr_auto] gap-3 border-b border-white/10 px-4 py-4 text-xs text-slate-300 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-white">
                    {user.displayName || user.email || user.id}
                  </p>
                  <p className="mt-1 truncate text-muted-foreground">
                    {user.email || user.id}
                  </p>
                </div>

                <span className="truncate">
                  {user.username ? `@${user.username}` : "—"}
                </span>

                <span>{user.wallet?.balance ?? 0}</span>
                <span>{user._count?.assets ?? 0}</span>
                <span>{user._count?.jobs ?? 0}</span>
                <span>{user._count?.payments ?? 0}</span>
                <span>{new Date(user.createdAt).toLocaleString()}</span>
                <Link href={`/admin/users/${user.id}`} className="text-primary">
                  View
                </Link>
              </div>
            ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
