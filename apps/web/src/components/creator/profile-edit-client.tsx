"use client"

import { useEffect, useState } from "react"
import { ReferralCard } from "@/components/profile/referral-card"

type ProfileResponse = {
  profile: {
    id: string
    username?: string | null
    fullName?: string | null
    avatarUrl?: string | null
    profile?: {
      bio?: string | null
      website?: string | null
      location?: string | null
    } | null
    _count?: {
      followers: number
      following: number
      posts: number
    }
  } | null
}

export function ProfileEditClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [origin, setOrigin] = useState("")

  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")

  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [posts, setPosts] = useState(0)

  const publicProfileUrl =
    username.trim().length > 0 && origin
      ? `${origin}/u/${username.trim()}`
      : null

  useEffect(() => {
    setOrigin(window.location.origin)

    async function loadProfile() {
      try {
        const res = await fetch("/api/me/profile")
        const data: ProfileResponse = await res.json()

        if (data.profile) {
          setUsername(data.profile.username ?? "")
          setFullName(data.profile.fullName ?? "")
          setBio(data.profile.profile?.bio ?? "")
          setWebsite(data.profile.profile?.website ?? "")
          setLocation(data.profile.profile?.location ?? "")
          setFollowers(data.profile._count?.followers ?? 0)
          setFollowing(data.profile._count?.following ?? 0)
          setPosts(data.profile._count?.posts ?? 0)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  async function handleSave() {
    setSaving(true)

    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          fullName,
          bio,
          website,
          location,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to save profile")
        setSaving(false)
        return
      }

      alert("Profile saved successfully")
    } catch {
      alert("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function copyPublicProfileLink() {
    if (!publicProfileUrl) {
      alert("Add a username first to create your public profile link")
      return
    }

    await navigator.clipboard.writeText(publicProfileUrl)
    alert("Public profile link copied")
  }

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="h-8 w-44 rounded bg-white/10" />
        <div className="mt-3 h-4 w-72 rounded bg-white/10" />
        <div className="mt-6 grid gap-4">
          <div className="h-14 rounded-[1rem] bg-white/10" />
          <div className="h-14 rounded-[1rem] bg-white/10" />
          <div className="h-32 rounded-[1rem] bg-white/10" />
        </div>
      </section>
    )
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          Edit profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage how your creator identity appears across Vireon AI.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-white/10 text-2xl text-white">
            {(fullName || username || "U").slice(0, 1).toUpperCase()}
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {fullName || "Unnamed creator"}
            </p>
            <p className="text-sm text-muted-foreground">
              @{username || "creator"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-muted-foreground">Followers</p>
            <p className="mt-2 text-2xl font-bold text-white">{followers}</p>
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-muted-foreground">Following</p>
            <p className="mt-2 text-2xl font-bold text-white">{following}</p>
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-muted-foreground">Public posts</p>
            <p className="mt-2 text-2xl font-bold text-white">{posts}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">Profile tips</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>Use a memorable username so people can find you easily.</li>
            <li>Write a short bio that explains your creative style.</li>
            <li>Add a website if you want people to see your portfolio.</li>
          </ul>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">Public profile link</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Share your public creator page so people can view your work and follow
            you.
          </p>

          <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            {publicProfileUrl ?? "Set a username to generate your public profile link."}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={publicProfileUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!publicProfileUrl}
              className={`rounded-full px-4 py-2 text-sm transition ${
                publicProfileUrl
                  ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "pointer-events-none border border-white/5 bg-white/5 text-slate-500"
              }`}
            >
              Open public profile
            </a>

            <button
              type="button"
              onClick={copyPublicProfileLink}
              className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/15"
            >
              Copy link
            </button>
          </div>
        </div>

        <div className="mt-6">
          <ReferralCard />
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white">
          Public profile settings
        </h2>
        <p className="mt-2 text-muted-foreground">
          These details appear on your creator page and public content surfaces.
        </p>

        <div className="mt-6 grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Full name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your display name"
              className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Bio
            </label>
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about your creative identity..."
              className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Website
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-site.com"
              className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2.5 text-sm text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </section>
    </div>
  )
}
