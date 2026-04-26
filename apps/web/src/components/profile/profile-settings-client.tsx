"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type Profile = {
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

export function ProfileSettingsClient() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/profile");
      const data = await res.json();

      const profile: Profile | null = data.profile ?? null;
      setDisplayName(profile?.displayName ?? "");
      setUsername(profile?.username ?? "");
      setAvatarUrl(profile?.avatarUrl ?? "");
      setBio(profile?.bio ?? "");
    }

    void loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          username,
          avatarUrl,
          bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save profile");
        return;
      }

      setDisplayName(data.profile?.displayName ?? "");
      setUsername(data.profile?.username ?? "");
      setAvatarUrl(data.profile?.avatarUrl ?? "");
      setBio(data.profile?.bio ?? "");
      alert("Profile updated");
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            Creator Settings
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
            Public creator profile
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Set up how your public gallery profile appears to other users.
          </p>
        </div>

        <div className="mt-8 grid gap-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <label className="text-sm font-medium text-white">Display name</label>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your creator name"
              className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <label className="text-sm font-medium text-white">Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              placeholder="e.g. emmycode"
              className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Your public profile will be available at /u/{username || "username"}.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <label className="text-sm font-medium text-white">Avatar URL</label>
            <input
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <label className="text-sm font-medium text-white">Bio</label>
            <textarea
              rows={5}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell people what kind of visuals you create..."
              className="mt-2 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          {avatarUrl ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-medium text-white">Preview</p>
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="size-16 rounded-2xl object-cover"
                />
                <div>
                  <p className="font-semibold text-white">
                    {displayName || username || "Creator"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{username || "username"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="mr-2 size-4" />
            {saving ? "Saving..." : "Save profile"}
          </Button>

          <button
            type="button"
            onClick={() => {
              window.localStorage.removeItem("vireon_onboarding_seen");
              window.location.reload();
            }}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Restart onboarding tour
          </button>
        </div>
      </section>
    </main>
  );
}
