"use client";

import {
  Edit3,
  Search,
  Trash2,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TemplateStatus = "draft" | "published" | "archived";
type TemplateType = "image" | "video";

type TemplateRecord = {
  id: string;
  title: string;
  type: TemplateType;
  category: string;
  prompt: string;
  negativePrompt?: string | null;
  previewUrl: string;
  thumbnailUrl?: string | null;
  sourceAssetId?: string | null;
  sourceGenerationJobId?: string | null;
  modelId?: string | null;
  settings?: Record<string, unknown> | null;
  status: TemplateStatus;
  sortOrder: number;
  createdAt: string;
};

type Candidate = {
  id: string;
  mediaType: TemplateType;
  title?: string | null;
  prompt?: string | null;
  fileUrl: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  user?: {
    email?: string | null;
    username?: string | null;
    displayName?: string | null;
  } | null;
  generationJob?: {
    id: string;
    modelId?: string | null;
    type: TemplateType;
    prompt?: string | null;
    negativePrompt?: string | null;
    style?: string | null;
    aspectRatio?: string | null;
    qualityMode?: string | null;
    promptBoost?: boolean | null;
    seed?: number | null;
    steps?: number | null;
    guidance?: number | null;
    duration?: number | null;
    motionIntensity?: string | null;
    cameraMove?: string | null;
    styleStrength?: string | null;
    motionGuidance?: number | null;
    shotType?: string | null;
    fps?: number | null;
    providerName?: string | null;
    providerJobId?: string | null;
  } | null;
  templates?: Array<{
    id: string;
    title: string;
    status: TemplateStatus;
  }>;
};

type EditableTemplate = {
  id?: string;
  title: string;
  type: TemplateType;
  category: string;
  prompt: string;
  negativePrompt: string;
  previewUrl: string;
  thumbnailUrl: string;
  sourceAssetId: string;
  sourceGenerationJobId: string;
  modelId: string;
  status: TemplateStatus;
  sortOrder: number;
  settings: Record<string, unknown>;
};

const emptyTemplate: EditableTemplate = {
  title: "",
  type: "image",
  category: "General",
  prompt: "",
  negativePrompt: "",
  previewUrl: "",
  thumbnailUrl: "",
  sourceAssetId: "",
  sourceGenerationJobId: "",
  modelId: "",
  status: "draft",
  sortOrder: 0,
  settings: {},
};

const adminInputClass =
  "w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-primary/45";

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text.slice(0, 300) || "Server returned an invalid response",
    };
  }
}

export function AdminTemplatesClient() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EditableTemplate>(emptyTemplate);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TemplateType>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);

    try {
      const [templatesRes, candidatesRes] = await Promise.all([
        fetch("/api/admin/templates"),
        fetch("/api/admin/templates/candidates"),
      ]);
      const [templatesData, candidatesData] = await Promise.all([
        readJsonResponse(templatesRes),
        readJsonResponse(candidatesRes),
      ]);

      if (!templatesRes.ok) {
        alert(templatesData.error || "Failed to load templates");
        return;
      }

      if (!candidatesRes.ok) {
        alert(candidatesData.error || "Failed to load template candidates");
        return;
      }

      setTemplates(templatesData.templates ?? []);
      setCandidates(candidatesData.candidates ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredCandidates = useMemo(() => {
    const term = query.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const prompt = candidate.generationJob?.prompt ?? candidate.prompt ?? "";
      const user =
        candidate.user?.email ??
        candidate.user?.username ??
        candidate.user?.displayName ??
        "";

      return (
        (typeFilter === "all" || candidate.mediaType === typeFilter) &&
        (!term ||
          prompt.toLowerCase().includes(term) ||
          user.toLowerCase().includes(term) ||
          candidate.generationJob?.modelId?.toLowerCase().includes(term) ||
          candidate.id.toLowerCase().includes(term))
      );
    });
  }, [candidates, query, typeFilter]);

  function settingsFromCandidate(candidate: Candidate) {
    const job = candidate.generationJob;

    if (!job) {
      return {};
    }

    return {
      style: job.style,
      aspectRatio: job.aspectRatio,
      qualityMode: job.qualityMode,
      promptBoost: job.promptBoost,
      seed: job.seed,
      steps: job.steps,
      guidance: job.guidance,
      duration: job.duration,
      motionIntensity: job.motionIntensity,
      cameraMove: job.cameraMove,
      styleStrength: job.styleStrength,
      motionGuidance: job.motionGuidance,
      shotType: job.shotType,
      fps: job.fps,
      providerName: job.providerName,
      providerJobId: job.providerJobId,
    };
  }

  function candidateToTemplate(candidate: Candidate): EditableTemplate {
    const job = candidate.generationJob;
    const prompt = job?.prompt ?? candidate.prompt ?? "";
    const title =
      candidate.title ||
      prompt.split(" ").slice(0, 4).join(" ") ||
      `Generated ${candidate.mediaType}`;

    return {
      title: title.slice(0, 90),
      type: candidate.mediaType,
      category: candidate.mediaType === "video" ? "Cinematic" : "Image",
      prompt,
      negativePrompt: job?.negativePrompt ?? "",
      previewUrl: candidate.fileUrl,
      thumbnailUrl: candidate.thumbnailUrl ?? "",
      sourceAssetId: candidate.id,
      sourceGenerationJobId: job?.id ?? "",
      modelId: job?.modelId ?? "",
      status: "draft",
      sortOrder: templates.length,
      settings: settingsFromCandidate(candidate),
    };
  }

  function templateToEditable(template: TemplateRecord): EditableTemplate {
    return {
      id: template.id,
      title: template.title,
      type: template.type,
      category: template.category,
      prompt: template.prompt,
      negativePrompt: template.negativePrompt ?? "",
      previewUrl: template.previewUrl,
      thumbnailUrl: template.thumbnailUrl ?? "",
      sourceAssetId: template.sourceAssetId ?? "",
      sourceGenerationJobId: template.sourceGenerationJobId ?? "",
      modelId: template.modelId ?? "",
      status: template.status,
      sortOrder: template.sortOrder,
      settings: template.settings ?? {},
    };
  }

  async function saveTemplate(statusOverride?: TemplateStatus) {
    setSaving(true);

    try {
      const payload = {
        ...selectedTemplate,
        status: statusOverride ?? selectedTemplate.status,
        negativePrompt: selectedTemplate.negativePrompt || null,
        thumbnailUrl: selectedTemplate.thumbnailUrl || null,
        sourceAssetId: selectedTemplate.sourceAssetId || null,
        sourceGenerationJobId: selectedTemplate.sourceGenerationJobId || null,
        modelId: selectedTemplate.modelId || null,
      };

      const endpoint = selectedTemplate.id
        ? `/api/admin/templates/${selectedTemplate.id}`
        : "/api/admin/templates";
      const method = selectedTemplate.id ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse(res);

      if (!res.ok) {
        alert(data.error || "Failed to save template");
        return;
      }

      setSelectedTemplate(templateToEditable(data.template));
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function createFromCandidate(
    candidate: Candidate,
    status: TemplateStatus
  ) {
    const draft = {
      ...candidateToTemplate(candidate),
      status,
    };

    setSelectedTemplate(draft);

    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        negativePrompt: draft.negativePrompt || null,
        thumbnailUrl: draft.thumbnailUrl || null,
        sourceAssetId: draft.sourceAssetId || null,
        sourceGenerationJobId: draft.sourceGenerationJobId || null,
        modelId: draft.modelId || null,
      }),
    });
    const data = await readJsonResponse(res);

    if (!res.ok) {
      alert(data.error || "Failed to create template");
      return;
    }

    setSelectedTemplate(templateToEditable(data.template));
    await loadData();
  }

  async function deleteTemplate(templateId: string) {
    if (!confirm("Delete this template?")) {
      return;
    }

    const res = await fetch(`/api/admin/templates/${templateId}`, {
      method: "DELETE",
    });
    const data = await readJsonResponse(res);

    if (!res.ok) {
      alert(data.error || "Failed to delete template");
      return;
    }

    setSelectedTemplate(emptyTemplate);
    await loadData();
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1500px] px-4 py-8">
        <div className="h-10 w-72 rounded bg-white/10" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_28rem]">
          <div className="h-120 rounded-3xl bg-white/5" />
          <div className="h-120 rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Wand2 className="size-3.5" />
              Template curation
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">
              Admin templates
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Promote successful image and video generations into reusable
              public templates. Published templates appear on the templates
              page automatically.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              active={typeFilter === "all"}
              onClick={() => setTypeFilter("all")}
            />
            <FilterButton
              label="Images"
              active={typeFilter === "image"}
              onClick={() => setTypeFilter("image")}
            />
            <FilterButton
              label="Videos"
              active={typeFilter === "video"}
              onClick={() => setTypeFilter("video")}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search generations by prompt, model, user, or asset ID..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                Completed generations
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredCandidates.length} candidates ready for curation.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onEdit={() => setSelectedTemplate(candidateToTemplate(candidate))}
                onAddDraft={() => void createFromCandidate(candidate, "draft")}
                onPublish={() => void createFromCandidate(candidate, "published")}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <TemplateEditor
            template={selectedTemplate}
            saving={saving}
            onChange={setSelectedTemplate}
            onSave={() => void saveTemplate()}
            onPublish={() => void saveTemplate("published")}
            onNew={() => setSelectedTemplate(emptyTemplate)}
          />

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
            <h2 className="text-xl font-bold text-white">
              Curated templates
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {templates.length} saved templates.
            </p>

            <div className="mt-4 space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-black/25 p-2"
                >
                  <MediaPreview
                    url={template.thumbnailUrl || template.previewUrl}
                    type={template.type}
                    className="size-18"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-white">
                        {template.title}
                      </p>
                      <StatusPill status={template.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {template.prompt}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate(templateToEditable(template))}
                        className="rounded-full bg-white/8 px-3 py-1 text-xs text-white transition hover:bg-white/12"
                      >
                        <Edit3 className="mr-1 inline size-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteTemplate(template.id)}
                        className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/15"
                      >
                        <Trash2 className="mr-1 inline size-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function CandidateCard({
  candidate,
  onEdit,
  onAddDraft,
  onPublish,
}: {
  candidate: Candidate;
  onEdit: () => void;
  onAddDraft: () => void;
  onPublish: () => void;
}) {
  const job = candidate.generationJob;
  const alreadyCurated = Boolean(candidate.templates?.length);

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
      <div className="relative">
        <MediaPreview
          url={candidate.thumbnailUrl || candidate.fileUrl}
          type={candidate.mediaType}
          className="h-42 w-full"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-black/65 px-2 py-1 text-[11px] font-bold capitalize text-white backdrop-blur">
            {candidate.mediaType}
          </span>
          {alreadyCurated ? (
            <span className="rounded-full bg-primary/90 px-2 py-1 text-[11px] font-bold text-black">
              Template
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-bold text-white">
          {candidate.title || job?.prompt || "Generated asset"}
        </p>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">
          {job?.prompt || candidate.prompt || "No prompt saved."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
          {job?.modelId ? <Chip label={job.modelId} /> : null}
          {job?.aspectRatio ? <Chip label={job.aspectRatio} /> : null}
          {job?.duration ? <Chip label={`${job.duration}s`} /> : null}
          {candidate.user?.email ? <Chip label={candidate.user.email} /> : null}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="h-9 rounded-xl border border-white/10 bg-white/8 text-xs font-bold text-white transition hover:bg-white/12"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onAddDraft}
            className="h-9 rounded-xl border border-primary/20 bg-primary/10 text-xs font-bold text-primary transition hover:bg-primary/15"
          >
            Draft
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="h-9 rounded-xl bg-primary text-xs font-bold text-black transition hover:bg-[#39f0b0]"
          >
            Publish
          </button>
        </div>
      </div>
    </article>
  );
}

function TemplateEditor({
  template,
  saving,
  onChange,
  onSave,
  onPublish,
  onNew,
}: {
  template: EditableTemplate;
  saving: boolean;
  onChange: (template: EditableTemplate) => void;
  onSave: () => void;
  onPublish: () => void;
  onNew: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            {template.id ? "Edit template" : "New template"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tune public title, prompt, category, and publish state.
          </p>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white transition hover:bg-white/12"
        >
          New
        </button>
      </div>

      {template.previewUrl ? (
        <MediaPreview
          url={template.thumbnailUrl || template.previewUrl}
          type={template.type}
          className="mt-4 h-48 w-full"
        />
      ) : null}

      <div className="mt-4 grid gap-3">
        <Field label="Title">
          <input
            value={template.title}
            onChange={(event) =>
              onChange({ ...template, title: event.target.value })
            }
            className={adminInputClass}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type">
            <select
              value={template.type}
              onChange={(event) =>
                onChange({ ...template, type: event.target.value as TemplateType })
              }
              className={adminInputClass}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </Field>
          <Field label="Category">
            <input
              value={template.category}
              onChange={(event) =>
                onChange({ ...template, category: event.target.value })
              }
              className={adminInputClass}
            />
          </Field>
        </div>

        <Field label="Prompt">
          <textarea
            value={template.prompt}
            onChange={(event) =>
              onChange({ ...template, prompt: event.target.value })
            }
            rows={5}
            className={`${adminInputClass} resize-none`}
          />
        </Field>

        <Field label="Negative prompt">
          <textarea
            value={template.negativePrompt}
            onChange={(event) =>
              onChange({ ...template, negativePrompt: event.target.value })
            }
            rows={3}
            className={`${adminInputClass} resize-none`}
          />
        </Field>

        <Field label="Preview URL">
          <input
            value={template.previewUrl}
            onChange={(event) =>
              onChange({ ...template, previewUrl: event.target.value })
            }
            className={adminInputClass}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Status">
            <select
              value={template.status}
              onChange={(event) =>
                onChange({
                  ...template,
                  status: event.target.value as TemplateStatus,
                })
              }
              className={adminInputClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Sort">
            <input
              type="number"
              value={template.sortOrder}
              onChange={(event) =>
                onChange({
                  ...template,
                  sortOrder: Number(event.target.value),
                })
              }
              className={adminInputClass}
            />
          </Field>
          <Field label="Model">
            <input
              value={template.modelId}
              onChange={(event) =>
                onChange({ ...template, modelId: event.target.value })
              }
              className={adminInputClass}
            />
          </Field>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={saving || !template.prompt || !template.previewUrl}
          onClick={onSave}
          className="h-10 rounded-xl border border-white/10 bg-white/8 text-sm font-bold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          disabled={saving || !template.prompt || !template.previewUrl}
          onClick={onPublish}
          className="h-10 rounded-xl bg-primary text-sm font-bold text-black transition hover:bg-[#39f0b0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Publish
        </button>
      </div>
    </section>
  );
}

function MediaPreview({
  url,
  type,
  className,
}: {
  url: string;
  type: TemplateType;
  className: string;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white/6 ${className}`}>
      {type === "video" ? (
        <video
          src={url}
          muted
          loop
          playsInline
          className="size-full object-cover"
        />
      ) : (
        <img src={url} alt="" className="size-full object-cover" />
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      {children}
    </label>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-black"
          : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
      }
    >
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: TemplateStatus }) {
  const className =
    status === "published"
      ? "bg-primary/15 text-primary"
      : status === "archived"
        ? "bg-slate-500/15 text-slate-300"
        : "bg-amber-500/15 text-amber-300";

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${className}`}>
      {status}
    </span>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="max-w-full truncate rounded-full bg-white/8 px-2 py-1">
      {label}
    </span>
  );
}
