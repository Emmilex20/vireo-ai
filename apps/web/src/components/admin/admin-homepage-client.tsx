"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Film,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

type HomepageSection =
  | "spotlight"
  | "suite"
  | "latest_models"
  | "inspiration_image"
  | "inspiration_video";

type HomepageItem = {
  id: string;
  section: HomepageSection;
  title: string;
  subtitle: string | null;
  href: string | null;
  mediaType: "image" | "video";
  mediaUrl: string;
  posterUrl: string | null;
  sourceAssetId: string | null;
  sourceGenerationJobId: string | null;
  sortOrder: number;
  isActive: boolean;
};

type HomepageCandidate = {
  id: string;
  mediaType: "image" | "video";
  title: string | null;
  prompt: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  user: {
    email: string | null;
    username: string | null;
    displayName: string | null;
  } | null;
  generationJob: {
    id: string;
    modelId: string | null;
    type: string | null;
    prompt: string | null;
  } | null;
  homepageItems: Array<{
    id: string;
    section: HomepageSection;
    title: string;
    isActive: boolean;
  }>;
};

type HomepageFormState = {
  section: HomepageSection;
  title: string;
  subtitle: string;
  href: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  posterUrl: string;
  sourceAssetId: string;
  sourceGenerationJobId: string;
  sortOrder: number;
  isActive: boolean;
};

const sections: Array<{ value: HomepageSection; label: string }> = [
  { value: "spotlight", label: "Hero spotlight" },
  { value: "suite", label: "Vireon Suite" },
  { value: "latest_models", label: "Latest AI Models" },
  { value: "inspiration_image", label: "Image inspirations" },
  { value: "inspiration_video", label: "Video inspirations" },
];

const emptyForm: HomepageFormState = {
  section: "spotlight",
  title: "",
  subtitle: "",
  href: "/studio",
  mediaType: "image",
  mediaUrl: "",
  posterUrl: "",
  sourceAssetId: "",
  sourceGenerationJobId: "",
  sortOrder: 0,
  isActive: true,
};

async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

function titleFromCandidate(candidate: HomepageCandidate) {
  return (
    candidate.title ||
    candidate.prompt?.slice(0, 80) ||
    candidate.generationJob?.prompt?.slice(0, 80) ||
    "Homepage creation"
  );
}

function subtitleFromCandidate(candidate: HomepageCandidate) {
  return (
    candidate.prompt?.slice(0, 160) ||
    candidate.generationJob?.prompt?.slice(0, 160) ||
    "Create something sharp, cinematic, and ready to share."
  );
}

export function AdminHomepageClient() {
  const [items, setItems] = useState<HomepageItem[]>([]);
  const [candidates, setCandidates] = useState<HomepageCandidate[]>([]);
  const [selectedItem, setSelectedItem] = useState<HomepageItem | null>(null);
  const [form, setForm] = useState<HomepageFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [sectionFilter, setSectionFilter] = useState<HomepageSection>("spotlight");

  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) =>
        filter === "all" ? true : candidate.mediaType === filter
      ),
    [candidates, filter]
  );

  const groupedItems = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        items: items.filter((item) => item.section === section.value),
      })),
    [items]
  );

  async function loadData() {
    setLoading(true);

    try {
      const [itemsRes, candidatesRes] = await Promise.all([
        fetch("/api/admin/homepage"),
        fetch("/api/admin/homepage/candidates"),
      ]);
      const [itemsData, candidatesData] = await Promise.all([
        readJsonResponse<{ items: HomepageItem[] }>(itemsRes),
        readJsonResponse<{ candidates: HomepageCandidate[] }>(candidatesRes),
      ]);

      setItems(itemsData.items);
      setCandidates(candidatesData.candidates);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to load homepage media");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function selectCandidate(candidate: HomepageCandidate) {
    setSelectedItem(null);
    setSectionFilter(candidate.mediaType === "video" ? "inspiration_video" : "spotlight");
    setForm({
      ...emptyForm,
      section: candidate.mediaType === "video" ? "inspiration_video" : "spotlight",
      title: titleFromCandidate(candidate),
      subtitle: subtitleFromCandidate(candidate),
      mediaType: candidate.mediaType,
      mediaUrl: candidate.fileUrl,
      posterUrl: candidate.thumbnailUrl || "",
      sourceAssetId: candidate.id,
      sourceGenerationJobId: candidate.generationJob?.id || "",
    });
  }

  function selectItem(item: HomepageItem) {
    setSelectedItem(item);
    setSectionFilter(item.section);
    setForm({
      section: item.section,
      title: item.title,
      subtitle: item.subtitle || "",
      href: item.href || "",
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl,
      posterUrl: item.posterUrl || "",
      sourceAssetId: item.sourceAssetId || "",
      sourceGenerationJobId: item.sourceGenerationJobId || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  }

  function resetForm() {
    setSelectedItem(null);
    setForm({ ...emptyForm, section: sectionFilter });
  }

  async function saveItem() {
    setSaving(true);

    try {
      const payload = {
        ...form,
        subtitle: form.subtitle || null,
        href: form.href || null,
        posterUrl: form.posterUrl || null,
        sourceAssetId: form.sourceAssetId || null,
        sourceGenerationJobId: form.sourceGenerationJobId || null,
      };
      const res = await fetch(
        selectedItem ? `/api/admin/homepage/${selectedItem.id}` : "/api/admin/homepage",
        {
          method: selectedItem ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      await readJsonResponse<{ item: HomepageItem }>(res);
      await loadData();
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save homepage item");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Remove this homepage item?")) return;

    try {
      const res = await fetch(`/api/admin/homepage/${itemId}`, {
        method: "DELETE",
      });
      await readJsonResponse<{ ok: boolean }>(res);
      await loadData();
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete homepage item");
    }
  }

  return (
    <main className="mx-auto w-full max-w-360 px-4 py-8 text-white sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Admin dashboard
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-bold">
            Homepage media
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Select the image and video cards shown across the home page.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-black"
        >
          <Plus className="size-4" />
          New item
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <div className="h-160 rounded-3xl bg-white/5" />
          <div className="h-160 rounded-3xl bg-white/5" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_430px]">
          <section className="rounded-3xl border border-white/10 bg-[#101214] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Completed generations</h2>
                <p className="text-sm text-slate-400">
                  Click an asset to prepare it for a homepage section.
                </p>
              </div>
              <div className="flex rounded-full border border-white/10 bg-black/30 p-1 text-xs font-bold">
                {(["all", "image", "video"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-3 py-1.5 capitalize ${
                      filter === value
                        ? "bg-white text-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => selectCandidate(candidate)}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-primary/60"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <MediaPreview candidate={candidate} />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-bold capitalize">
                      {candidate.mediaType === "video" ? (
                        <Film className="size-3" />
                      ) : (
                        <ImageIcon className="size-3" />
                      )}
                      {candidate.mediaType}
                    </span>
                    {candidate.homepageItems.length ? (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[11px] font-bold text-black">
                        <Check className="size-3" />
                        Used
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-sm font-bold">
                      {titleFromCandidate(candidate)}
                    </p>
                    <p className="line-clamp-2 text-xs leading-5 text-slate-400">
                      {subtitleFromCandidate(candidate)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-white/10 bg-[#101214] p-4">
              <h2 className="text-lg font-bold">
                {selectedItem ? "Edit homepage card" : "Create homepage card"}
              </h2>
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Section
                  <select
                    value={form.section}
                    onChange={(event) => {
                      const section = event.target.value as HomepageSection;
                      setForm((current) => ({ ...current, section }));
                      setSectionFilter(section);
                    }}
                    className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm normal-case tracking-normal text-white"
                  >
                    {sections.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </label>

                <TextInput
                  label="Title"
                  value={form.title}
                  onChange={(value) => setForm((current) => ({ ...current, title: value }))}
                />
                <TextInput
                  label="Subtitle"
                  value={form.subtitle}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, subtitle: value }))
                  }
                />
                <TextInput
                  label="Link"
                  value={form.href}
                  onChange={(value) => setForm((current) => ({ ...current, href: value }))}
                />
                <TextInput
                  label="Media URL"
                  value={form.mediaUrl}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, mediaUrl: value }))
                  }
                />
                <TextInput
                  label="Poster URL"
                  value={form.posterUrl}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, posterUrl: value }))
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Media type
                    <select
                      value={form.mediaType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          mediaType: event.target.value as "image" | "video",
                        }))
                      }
                      className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm normal-case tracking-normal text-white"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Sort
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          sortOrder: Number(event.target.value),
                        }))
                      }
                      className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm normal-case tracking-normal text-white"
                    />
                  </label>
                </div>

                <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-bold">
                  Active on homepage
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="size-4 accent-primary"
                  />
                </label>

                <button
                  type="button"
                  onClick={saveItem}
                  disabled={saving || !form.title || !form.mediaUrl}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Save homepage card
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#101214] p-4">
              <h2 className="text-lg font-bold">Current homepage</h2>
              <div className="mt-4 space-y-4">
                {groupedItems.map((group) => (
                  <div key={group.value}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {group.label}
                    </p>
                    <div className="mt-2 space-y-2">
                      {group.items.length ? (
                        group.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-white/10 bg-black/30 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="line-clamp-1 text-sm font-bold">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-xs capitalize text-slate-400">
                                  {item.mediaType} / sort {item.sortOrder}
                                  {item.isActive ? "" : " / inactive"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => selectItem(item)}
                                  className="rounded-full bg-white/10 p-2 text-slate-200 hover:text-white"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteItem(item.id)}
                                  className="rounded-full bg-red-500/10 p-2 text-red-300 hover:text-red-200"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-slate-500">
                          No custom cards yet.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm normal-case tracking-normal text-white"
      />
    </label>
  );
}

function MediaPreview({ candidate }: { candidate: HomepageCandidate }) {
  if (candidate.mediaType === "video") {
    return (
      <video
        src={candidate.fileUrl}
        poster={candidate.thumbnailUrl || undefined}
        muted
        playsInline
        loop
        className="size-full object-cover opacity-85 transition group-hover:scale-105 group-hover:opacity-100"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidate.thumbnailUrl || candidate.fileUrl}
      alt={candidate.title || candidate.prompt || "Homepage candidate"}
      className="size-full object-cover opacity-85 transition group-hover:scale-105 group-hover:opacity-100"
    />
  );
}
