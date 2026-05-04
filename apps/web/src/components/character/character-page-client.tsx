"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CHARACTER_GENERATION_MODELS,
  getCharacterGenerationCost,
  type CharacterGenerationModelId,
} from "@/lib/characters/character-generation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  Cpu,
  FolderOpen,
  Grid2x2,
  Loader2,
  Download,
  Eye,
  ImageIcon,
  ImagePlus,
  Minus,
  Palette,
  Pencil,
  Play,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tags,
  Trash2,
  Upload,
  UserRound,
  Video,
  WandSparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type CharacterPageClientProps = {
  hasCharacters: boolean;
};

type CharacterRecord = {
  id: string;
  name: string;
  description?: string | null;
  backgroundStory?: string | null;
  mode: string;
  status: "processing" | "completed" | "failed";
  modelId?: string | null;
  prompt?: string | null;
  sourceImageUrl?: string | null;
  imageUrl?: string | null;
  style?: string | null;
  vibe?: string | null;
  gender?: string | null;
  ethnicity?: string | null;
  ageRange?: string | null;
  count: number;
  creditsUsed: number;
  failureReason?: string | null;
  createdAt: string;
};

type CharacterModalView = "chooser" | "image" | "describe" | "builder";

type BuilderStep = "vibe" | "gender" | "ethnicity" | "age" | "check";

type BuilderOption = {
  label: string;
  tone: string;
  image: string;
  silhouette?: "full" | "portrait" | "profile";
};

const choiceCards = [
  {
    id: "image",
    title: "Start from an image",
    subtitle: "Upload a front-facing photo and build a reusable identity.",
    accent: "from-fuchsia-500/25 via-white/8 to-cyan-400/15",
    icon: ImagePlus,
    badge: undefined,
  },
  {
    id: "describe",
    title: "Describe your character",
    subtitle: "Create from a written identity, look, and story direction.",
    accent: "from-emerald-400/20 via-white/8 to-amber-300/15",
    icon: Sparkles,
    badge: undefined,
  },
  {
    id: "builder",
    title: "Build your character",
    subtitle: "Use guided controls for vibe, gender, age, and style.",
    accent: "from-sky-400/20 via-white/8 to-fuchsia-400/20",
    icon: WandSparkles,
    badge: "New",
  },
] as const;

const quickStarts = [
  {
    title: "Create Character",
    subtitle: "Guided identity setup",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=720&q=80",
    badge: "New",
    action: "builder" as CharacterModalView,
    tone: "from-yellow-200/80 via-transparent to-black/60",
  },
  {
    title: "Character Image",
    subtitle: "Generate poses and portraits",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=80",
    badge: undefined,
    action: "describe" as CharacterModalView,
    tone: "from-emerald-300/70 via-transparent to-black/65",
  },
  {
    title: "Character Video",
    subtitle: "Animate consistent people",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=720&q=80",
    badge: undefined,
    action: "describe" as CharacterModalView,
    tone: "from-fuchsia-500/75 via-transparent to-black/65",
  },
  {
    title: "Talking Video",
    subtitle: "Voice-ready performance",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=720&q=80",
    badge: undefined,
    action: "image" as CharacterModalView,
    tone: "from-amber-300/75 via-transparent to-black/70",
  },
  {
    title: "Motion Sync",
    subtitle: "Reference motion transfer",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=720&q=80",
    badge: undefined,
    action: "image" as CharacterModalView,
    tone: "from-cyan-300/60 via-transparent to-black/65",
  },
] as const;

const heroFrames = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&q=80",
] as const;

const characterStyleOptions = [
  "Photorealistic",
  "Digital Art",
  "Anime",
  "3D",
  "Pixar",
  "Fantasy",
  "RPG",
  "ComicBook",
  "Clay",
  "Vector art",
  "Minimalist",
  "WaterColor",
  "Oil Painting",
  "GTA",
] as const;

const builderSteps: Array<{ id: BuilderStep; label: string }> = [
  { id: "vibe", label: "Look Vibe" },
  { id: "gender", label: "Gender" },
  { id: "ethnicity", label: "Ethnicity" },
  { id: "age", label: "Age Range" },
  { id: "check", label: "Check" },
];

const vibeOptions: BuilderOption[] = [
  { label: "Casual", tone: "from-sky-300/35 via-white/8 to-emerald-300/25", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=520&q=80" },
  { label: "Street", tone: "from-amber-300/30 via-red-400/20 to-slate-950/80", image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=520&q=80" },
  { label: "Fashion", tone: "from-zinc-200/35 via-stone-400/20 to-zinc-950/80", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=520&q=80" },
  { label: "2000s", tone: "from-pink-300/35 via-sky-300/20 to-violet-500/30", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=520&q=80" },
  { label: "Dystopian", tone: "from-stone-300/25 via-amber-900/25 to-slate-950/90", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=520&q=80" },
  { label: "Vintage Glam", tone: "from-yellow-200/30 via-rose-300/25 to-emerald-950/70", image: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=520&q=80" },
  { label: "Avant Garde", tone: "from-cyan-300/25 via-slate-300/25 to-fuchsia-500/25", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=520&q=80" },
  { label: "1920s", tone: "from-amber-200/35 via-stone-300/25 to-fuchsia-700/30", image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=520&q=80" },
];

const genderOptions: BuilderOption[] = [
  { label: "Male", tone: "from-cyan-200/30 via-white/10 to-indigo-400/25", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=520&q=80", silhouette: "portrait" },
  { label: "Female", tone: "from-pink-200/30 via-white/10 to-violet-400/25", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=520&q=80", silhouette: "portrait" },
  { label: "Androgynous", tone: "from-emerald-200/30 via-white/10 to-blue-400/25", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=520&q=80", silhouette: "portrait" },
];

const ethnicityOptions: BuilderOption[] = [
  { label: "Caucasian", tone: "from-teal-200/30 via-white/10 to-indigo-400/25", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
  { label: "African", tone: "from-emerald-200/30 via-amber-200/15 to-violet-400/25", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
  { label: "East Asian", tone: "from-cyan-200/30 via-white/10 to-indigo-400/25", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
  { label: "Latino", tone: "from-lime-200/25 via-amber-200/15 to-violet-400/25", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
];

const ageOptions: BuilderOption[] = [
  { label: "Teen", tone: "from-cyan-200/30 via-white/10 to-indigo-400/25", image: "https://images.unsplash.com/photo-1524666041070-9d87656c25bb?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
  { label: "Young Adult", tone: "from-teal-200/30 via-white/10 to-fuchsia-400/25", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
  { label: "Middle-aged", tone: "from-emerald-200/30 via-white/10 to-indigo-400/25", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
  { label: "Senior", tone: "from-teal-200/30 via-white/10 to-blue-400/25", image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=520&q=80", silhouette: "profile" },
];

export function CharacterPageClient({ hasCharacters }: CharacterPageClientProps) {
  const [modalOpen, setModalOpen] = useState(!hasCharacters);
  const [modalView, setModalView] = useState<CharacterModalView>("chooser");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [characters, setCharacters] = useState<CharacterRecord[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function replaceImagePreview(file?: File) {
    if (!file) return;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImagePreview() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImageFile(null);
    setImagePreview(null);
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    let cancelled = false;

    async function loadCharacters() {
      try {
        const response = await fetch("/api/characters");
        const data = await response.json();

        if (!cancelled && response.ok) {
          setCharacters(data.characters ?? []);
        }
      } finally {
        if (!cancelled) {
          setLoadingCharacters(false);
        }
      }
    }

    void loadCharacters();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const processing = characters.filter(
      (character) => character.status === "processing"
    );

    if (!processing.length) return;

    const interval = window.setInterval(() => {
      void Promise.all(
        processing.map(async (character) => {
          const response = await fetch(`/api/characters/status/${character.id}`);
          const data = await response.json();

          if (response.ok && data.character) {
            setCharacters((current) =>
              current.map((item) =>
                item.id === data.character.id ? data.character : item
              )
            );
          }
        })
      );
    }, 3500);

    return () => window.clearInterval(interval);
  }, [characters]);

  function closeModal() {
    setModalOpen(false);
    setModalView("chooser");
  }

  function openModal(view: CharacterModalView = "chooser") {
    setModalView(view);
    setModalOpen(true);
  }

  async function uploadSelectedImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/image-reference", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to upload character reference image");
    }

    return data.url as string;
  }

  async function generateCharacter(input: {
    mode: CharacterModalView;
    name?: string;
    modelId?: CharacterGenerationModelId;
    description?: string;
    backgroundStory?: string;
    style?: string;
    vibe?: string;
    gender?: string;
    ethnicity?: string;
    ageRange?: string;
    count?: number;
    imageFile?: File | null;
  }) {
    setGenerating(true);
    setGenerationError(null);

    try {
      const sourceImageUrl =
        input.mode === "image" && input.imageFile
          ? await uploadSelectedImage(input.imageFile)
          : undefined;

      const response = await fetch("/api/characters/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          modelId: input.modelId,
          description: input.description,
          backgroundStory: input.backgroundStory,
          style: input.style,
          vibe: input.vibe,
          gender: input.gender,
          ethnicity: input.ethnicity,
          ageRange: input.ageRange,
          count: input.count,
          mode: input.mode === "builder" ? "builder" : input.mode,
          sourceImageUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate character");
      }

      const generatedCharacters = Array.isArray(data.characters)
        ? data.characters
        : data.character
          ? [data.character]
          : [];

      if (generatedCharacters.length) {
        setCharacters((current) => [
          ...generatedCharacters,
          ...current.filter(
            (item) =>
              !generatedCharacters.some(
                (character: CharacterRecord) => character.id === item.id
              )
          ),
        ]);
      }

      clearImagePreview();
      closeModal();
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Failed to generate character"
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#050607] sm:rounded-[1.35rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_6%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(217,70,239,0.13),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_18%)]" />
      <div className={cn("relative grid h-full min-h-0 gap-2 p-2 sm:p-2 lg:grid-cols-[minmax(24rem,32rem)_1fr]", modalOpen ? "blur-sm" : "")}>
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[#080a0b] p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] sm:rounded-[1.1rem] sm:border sm:border-white/10 sm:bg-[#101315]/92 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/8 hover:text-white sm:hidden"
                aria-label="Back"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="min-w-0">
              <div className="hidden text-xs font-medium text-slate-400 sm:block">
                Create <span className="mx-1 text-slate-600">/</span>{" "}
                <span className="text-slate-200">Character</span>
              </div>
              <div className="flex items-center gap-2 sm:mt-4 sm:gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-white text-black sm:size-9">
                  <UserRound className="size-4" />
                </span>
                <h1 className="font-heading text-lg font-bold text-white sm:text-xl">
                  Character
                </h1>
              </div>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-bold text-slate-300 underline-offset-4 transition hover:bg-white/8 hover:text-white hover:underline sm:h-10 sm:gap-2 sm:rounded-xl sm:bg-white/8 sm:px-3 sm:text-sm sm:text-white sm:no-underline"
            >
              <BookOpen className="size-3.5 sm:size-4" />
              Tutorials
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
            <button
              type="button"
              onClick={() => openModal("chooser")}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white/[0.07] sm:p-5"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.18),transparent_58%)] opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex min-h-24 flex-col items-center justify-center text-center sm:min-h-28">
                <span className="flex size-12 items-center justify-center rounded-full border border-white/14 bg-black/25 text-white sm:size-14">
                  <UserRound className="size-6 sm:size-7" />
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-black leading-tight text-white sm:mt-4 sm:gap-2 sm:text-base">
                  Create Character
                  <Plus className="size-3.5 rounded-full bg-white text-black sm:size-4" />
                </span>
              </div>
            </button>

            <button
              type="button"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-left transition hover:-translate-y-0.5 hover:border-fuchsia-400/35 hover:bg-white/[0.07] sm:p-5"
            >
              <div className="relative flex min-h-24 flex-col items-center justify-center text-center sm:min-h-28">
                <div className="flex -space-x-3">
                  {heroFrames.slice(0, 4).map((frame, index) => (
                    <span
                      key={frame}
                      className="relative size-9 overflow-hidden rounded-full border-2 border-[#151719] bg-white/10 sm:size-11"
                    >
                      <Image
                        src={frame}
                        alt={`Library character ${index + 1}`}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                  ))}
                </div>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-black leading-tight text-white sm:mt-4 sm:gap-2 sm:text-base">
                  Browse Library
                  <span className="flex size-4 items-center justify-center rounded-full bg-white text-black">
                    <ChevronRightMini />
                  </span>
                </span>
              </div>
            </button>
          </div>

          {generationError ? (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
              {generationError}
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between sm:mt-7">
            <h2 className="text-sm font-black text-white">Quick Starts</h2>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary sm:px-3 sm:text-xs">
              5 workflows
            </span>
          </div>

          <div className="mt-3 grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2.5 overflow-y-auto pb-20 pr-1 sm:gap-3 sm:pb-0">
            {quickStarts.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => openModal(item.action)}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#181a1d] p-1.5 text-left shadow-[0_10px_26px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] sm:bg-white/[0.035]"
              >
                <div className="relative aspect-[0.82] overflow-hidden rounded-xl bg-white/5">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 15rem, (min-width: 640px) 45vw, 50vw"
                    className="object-cover object-center transition duration-500 group-hover:scale-105"
                  />
                  <div className={cn("absolute inset-0 bg-gradient-to-t", item.tone)} />
                  {item.badge ? (
                    <span className="absolute left-0 top-0 rounded-br-xl bg-yellow-200 px-3 py-1 text-xs font-black italic text-black">
                      {item.badge}
                    </span>
                  ) : null}
                  {item.title === "Talking Video" ? (
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-fuchsia-600">
                      <AudioBars />
                    </span>
                  ) : null}
                  {item.title === "Motion Sync" || item.title === "Character Video" ? (
                    <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl bg-black/70 text-fuchsia-300 backdrop-blur sm:right-3 sm:top-3 sm:size-9">
                      <Play className="size-3.5 fill-current sm:size-4" />
                    </span>
                  ) : (
                    <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl bg-black/65 text-white/80 backdrop-blur">
                      <Star className="size-4" />
                    </span>
                  )}
                </div>
                <div className="px-1.5 pb-2 pt-2 sm:px-2 sm:pt-2.5">
                  <h3 className="text-[13px] font-black leading-tight text-white sm:text-base">{item.title}</h3>
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 hidden shrink-0 border-t border-white/8 pt-4 sm:grid sm:grid-cols-4 sm:gap-2">
            <StudioTab icon={Video} label="Video" />
            <StudioTab icon={ImageIcon} label="Image" />
            <StudioTab icon={UserRound} label="Character" active />
            <StudioTab icon={Palette} label="World" />
          </div>
        </section>

        <section className="hidden min-h-0 flex-col overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#0d1013]/94 sm:flex">
          <div className="flex flex-col gap-3 border-b border-white/8 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-black"
              >
                <Sparkles className="size-4" />
                All Creations
                <ChevronDown className="size-4" />
              </button>
              <ToolbarButton icon={Tags} label="Labels" />
              <ToolbarButton icon={FolderOpen} label="Folders" />
              <ToolbarButton icon={Grid2x2} label="Templates" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden h-10 items-center gap-3 px-2 md:flex">
                <span className="h-1 w-24 rounded-full bg-white/16">
                  <span className="block h-full w-2/3 rounded-full bg-white/70" />
                </span>
                <span className="size-4 rounded-full bg-white" />
              </div>
              <IconFilter icon={ImageIcon} />
              <IconFilter icon={Video} />
              <IconFilter icon={Palette} />
              <button
                type="button"
                className="h-10 rounded-xl bg-white px-4 text-sm font-black text-black"
              >
                All
              </button>
              <IconFilter icon={Star} />
              <IconFilter icon={Shield} />
              <IconFilter icon={SlidersHorizontal} />
              <IconFilter icon={Grid2x2} />
              <IconFilter icon={Search} />
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(186,120,74,0.36),transparent_26%),radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.05),transparent_46%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.08),transparent_35%,rgba(217,70,239,0.08))]" />

            <div className="relative z-10 flex h-full w-full max-w-4xl flex-col items-center justify-center text-center">
              {loadingCharacters ? (
                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-slate-300">
                  <Loader2 className="size-4 animate-spin" />
                  Loading character library
                </div>
              ) : characters.length ? (
                <>
                  <div className="flex w-full items-center justify-between gap-4 text-left">
                    <div>
                      <h2 className="text-xl font-black text-white">
                        Your characters
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Reuse, view, or download the identities you have created.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openModal("chooser")}
                      className="hidden h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-black transition hover:bg-slate-200 sm:inline-flex"
                    >
                      Create another
                      <Sparkles className="size-4" />
                    </button>
                  </div>
                  <CharacterLibraryGrid characters={characters} />
                  <button
                    type="button"
                    onClick={() => openModal("chooser")}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-black transition hover:bg-slate-200 sm:hidden"
                  >
                    Create another
                    <Sparkles className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="relative h-28 w-full max-w-md sm:h-36 xl:h-44 xl:max-w-xl">
                    {heroFrames.map((frame, index) => {
                      const transforms = [
                        "left-[8%] top-15 -rotate-12 scale-90",
                        "left-[25%] top-9 -rotate-6",
                        "left-[41%] top-0 z-20 scale-110",
                        "right-[23%] top-10 rotate-8",
                        "right-[6%] top-15 rotate-12 scale-90",
                      ];

                      return (
                        <div
                          key={frame}
                          className={cn(
                            "absolute h-22 w-18 overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-[0_18px_45px_rgba(0,0,0,0.38)] sm:h-28 sm:w-22 xl:h-36 xl:w-28",
                            transforms[index]
                          )}
                        >
                          <Image
                            src={frame}
                            alt={`Character preview ${index + 1}`}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                          {index === 2 ? (
                            <span className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/80 text-amber-500 shadow-lg backdrop-blur">
                              <Play className="size-4 fill-current" />
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <h2 className="mt-4 text-lg font-black text-white xl:mt-7 xl:text-xl">
                    Build reusable people once. Use them everywhere.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Your character library keeps identity references, preferred
                    styles, labels, folders, and ready-to-use shortcuts for image
                    and video scenes.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openModal("chooser")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:bg-slate-200"
                    >
                      Create for free
                      <Sparkles className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("image")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      Start from image
                      <ImagePlus className="size-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[70] grid items-start justify-items-center overflow-y-auto bg-black/70 px-2 py-3 backdrop-blur-md sm:place-items-center sm:px-4 sm:py-6">
          {modalView === "chooser" ? (
            <CreateCharacterChooser
              onClose={closeModal}
              onStartFromImage={() => setModalView("image")}
              onDescribe={() => setModalView("describe")}
              onBuild={() => setModalView("builder")}
            />
          ) : modalView === "describe" ? (
            <DescribeCharacterModal
              generating={generating}
              onClose={closeModal}
              onGenerate={(input) =>
                generateCharacter({ ...input, mode: "describe" })
              }
            />
          ) : modalView === "builder" ? (
            <BuildCharacterModal
              generating={generating}
              onClose={closeModal}
              onGenerate={(input) =>
                generateCharacter({ ...input, mode: "builder" })
              }
            />
          ) : (
            <StartFromImageModal
              imagePreview={imagePreview}
              imageFile={selectedImageFile}
              generating={generating}
              fileInputRef={fileInputRef}
              onClose={closeModal}
              onBack={() => setModalView("chooser")}
              onClearImage={clearImagePreview}
              onPickImage={replaceImagePreview}
              onGenerate={(input) =>
                generateCharacter({
                  ...input,
                  mode: "image",
                  imageFile: selectedImageFile,
                })
              }
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/7 hover:text-white"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function IconFilter({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button
      type="button"
      className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-400 transition hover:bg-white/8 hover:text-white"
    >
      <Icon className="size-4" />
    </button>
  );
}

function StudioTab({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full text-xs font-bold transition",
        active
          ? "bg-white text-black"
          : "bg-white/[0.035] text-slate-400 hover:bg-white/8 hover:text-white"
      )}
    >
      <Icon className="size-4" />
      <span className="sr-only lg:not-sr-only">{label}</span>
    </button>
  );
}

function ChevronRightMini() {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5 fill-none stroke-current stroke-[2.2]">
      <path d="M3.5 2 6.5 5 3.5 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AudioBars() {
  return (
    <span className="inline-flex h-4 items-end gap-0.5">
      {[5, 8, 11, 7, 13, 9, 6].map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-0.5 rounded-full bg-current"
          style={{ height }}
        />
      ))}
    </span>
  );
}

function CharacterLibraryGrid({ characters }: { characters: CharacterRecord[] }) {
  return (
    <div className="mt-5 grid max-h-[min(22rem,34vh)] w-full max-w-4xl gap-3 overflow-y-auto pr-1 text-left sm:grid-cols-2 xl:grid-cols-3">
      {characters.map((character) => (
        <article
          key={character.id}
          className="overflow-hidden rounded-2xl border border-white/10 bg-black/24 shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
        >
          <div className="relative aspect-[4/3] bg-white/[0.035]">
            {character.imageUrl ? (
              <Image
                src={character.imageUrl}
                alt={character.name}
                fill
                sizes="(min-width: 1280px) 18rem, (min-width: 640px) 42vw, 90vw"
                className="object-cover"
              />
            ) : character.sourceImageUrl ? (
              <Image
                src={character.sourceImageUrl}
                alt={`${character.name} source reference`}
                fill
                sizes="(min-width: 1280px) 18rem, (min-width: 640px) 42vw, 90vw"
                className="object-cover opacity-70"
              />
            ) : (
              <div className="grid h-full place-items-center text-primary">
                <UserRound className="size-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-transparent to-transparent" />
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-black capitalize",
                character.status === "completed"
                  ? "bg-primary/90 text-black"
                  : character.status === "failed"
                    ? "bg-red-500 text-white"
                    : "bg-white/12 text-white backdrop-blur"
              )}
            >
              {character.status === "processing" ? "Generating" : character.status}
            </span>
            {character.status === "processing" ? (
              <div className="absolute inset-0 grid place-items-center bg-black/35">
                <div className="rounded-full border border-white/10 bg-black/55 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                  <Loader2 className="mr-2 inline size-4 animate-spin" />
                  Building identity
                </div>
              </div>
            ) : null}
          </div>
          <div className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-white">
                  {character.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-400">
                  {character.description ||
                    [character.vibe, character.gender, character.ethnicity, character.ageRange]
                      .filter(Boolean)
                      .join(", ") ||
                    "Reusable character identity"}
                </p>
              </div>
              <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] font-bold text-slate-300">
                {character.creditsUsed} cr
              </span>
            </div>

            {character.failureReason ? (
              <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100">
                {character.failureReason}
              </p>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <a
                href={character.imageUrl || character.sourceImageUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-2.5 text-xs font-bold text-white transition hover:bg-white/10",
                  !character.imageUrl && !character.sourceImageUrl
                    ? "pointer-events-none opacity-50"
                    : ""
                )}
              >
                <Eye className="size-4" />
                View
              </a>
              <a
                href={character.imageUrl || character.sourceImageUrl || "#"}
                download
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-black text-black transition hover:bg-slate-200",
                  !character.imageUrl && !character.sourceImageUrl
                    ? "pointer-events-none opacity-50"
                    : ""
                )}
              >
                <Download className="size-4" />
                Download
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function CreateCharacterChooser({
  onClose,
  onStartFromImage,
  onDescribe,
  onBuild,
}: {
  onClose: () => void;
  onStartFromImage: () => void;
  onDescribe: () => void;
  onBuild: () => void;
}) {
  return (
    <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111315] shadow-[0_30px_120px_rgba(0,0,0,0.62)] sm:rounded-[1.35rem]">
      <div className="relative px-4 pb-4 pt-11 text-center sm:px-8 sm:pb-10 sm:pt-14">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white sm:right-5 sm:top-5 sm:size-9"
          aria-label="Close"
        >
          <X className="size-4.5 sm:size-5" />
        </button>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-4xl">
          Create a <span className="text-fuchsia-400">character</span>
        </h2>
        <p className="mx-auto mt-2 max-w-[17rem] text-xs font-medium leading-5 text-slate-400 sm:mt-3 sm:max-w-none sm:text-sm">
          Make a reusable character you can bring into future images and videos.
        </p>

        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-2.5 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {choiceCards.map((card) => {
            const Icon = card.icon;
            const isImage = card.id === "image";
            const isDescribe = card.id === "describe";
            const isBuilder = card.id === "builder";
            return (
              <button
                key={card.id}
                type="button"
                onClick={
                  isImage
                    ? onStartFromImage
                    : isDescribe
                      ? onDescribe
                      : isBuilder
                        ? onBuild
                        : undefined
                }
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] p-2 text-left transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.055] sm:rounded-[1.05rem]"
              >
                {card.badge ? (
                  <span className="absolute left-1.5 top-1.5 z-10 rounded-br-xl rounded-tl-xl bg-yellow-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-black sm:left-2 sm:top-2 sm:px-3 sm:py-1 sm:text-xs">
                    {card.badge}
                  </span>
                ) : null}
                <div className={cn("relative aspect-[1.04/1] overflow-hidden rounded-xl bg-gradient-to-br", card.accent)}>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:18px_18px]" />
                  <div className="absolute inset-3 grid place-items-center rounded-2xl border border-white/10 bg-black/18 sm:inset-5 sm:rounded-3xl">
                    <Icon className="size-9 text-white drop-shadow-[0_12px_30px_rgba(236,72,153,0.35)] sm:size-16" />
                  </div>
                  {isImage ? (
                    <div className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-fuchsia-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_12px_30px_rgba(217,70,239,0.4)] sm:bottom-6 sm:px-4 sm:py-2 sm:text-xs">
                      Create
                      <Sparkles className="size-3.5" />
                    </div>
                  ) : null}
                </div>
                <div className="px-1 pb-1 pt-2.5 text-center sm:pb-2 sm:pt-4">
                  <h3 className="truncate text-sm font-bold text-white sm:text-base">{card.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
                    {card.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DescribeCharacterModal({
  generating,
  onClose,
  onGenerate,
}: {
  generating: boolean;
  onClose: () => void;
  onGenerate: (input: {
    description: string;
    modelId: CharacterGenerationModelId;
    style: string;
    count: number;
  }) => void;
}) {
  const [count, setCount] = useState(4);
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState<CharacterGenerationModelId>(
    "google/nano-banana-pro"
  );
  const [style, setStyle] = useState("Photorealistic");
  const [openMenu, setOpenMenu] = useState<CharacterSelectMenuId>(null);
  const selectedModel =
    CHARACTER_GENERATION_MODELS.find((model) => model.id === modelId) ??
    CHARACTER_GENERATION_MODELS[2];
  const credits = getCharacterGenerationCost(count);

  return (
    <div className="relative h-[min(54rem,calc(100vh-1.5rem))] w-full max-w-[118rem] overflow-hidden rounded-[1rem] border border-white/10 bg-[#111315] shadow-[0_30px_120px_rgba(0,0,0,0.68)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,114,255,0.55),rgba(147,51,234,0.2)_17%,transparent_38%),linear-gradient(180deg,rgba(16,18,22,0.22),#111315_64%)]" />
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.34),transparent_44%)] blur-xl" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-40 flex size-11 items-center justify-center rounded-xl bg-white/7 text-slate-300 transition hover:bg-white/12 hover:text-white sm:right-5 sm:top-5 sm:size-13"
        aria-label="Close"
      >
        <X className="size-5 sm:size-6" />
      </button>

      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center px-4 pt-14 sm:px-8 sm:pt-20">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Describe your character
        </h2>

        <div className="relative mt-8 h-24 w-80 max-w-full">
          {[
            { label: "A", className: "left-8 top-7 -rotate-12 bg-rose-400/80" },
            { label: "B", className: "left-20 top-3 -rotate-4 bg-slate-200/90 text-slate-900" },
            { label: "C", className: "left-34 top-0 z-10 scale-110 bg-violet-400/90" },
            { label: "D", className: "right-20 top-3 rotate-5 bg-cyan-400/90 text-slate-950" },
            { label: "E", className: "right-8 top-7 rotate-12 bg-amber-300/90 text-slate-950" },
          ].map((avatar) => (
            <div
              key={avatar.label}
              className={cn(
                "absolute flex size-16 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-white/35 to-transparent text-xl font-black text-white shadow-[0_18px_45px_rgba(0,0,0,0.32)]",
                avatar.className
              )}
            >
              {avatar.label}
            </div>
          ))}
        </div>

        <div className="relative z-20 mt-8 w-full max-w-[45rem] overflow-visible rounded-[1rem] border border-white/8 bg-[#25272c] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe your character in detail.... Include appearance, style, clothing, and any unique features."
            className="h-32 w-full resize-none bg-transparent px-5 py-5 text-sm leading-6 text-white outline-none placeholder:text-slate-500 sm:h-36"
          />

          <div className="relative z-30 flex flex-col gap-3 border-t border-white/0 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <CharacterSelectMenu
                id="model"
                icon={Cpu}
                label={selectedModel.label}
                options={CHARACTER_GENERATION_MODELS.map((model) => ({
                  label: model.label,
                  value: model.id,
                }))}
                value={modelId}
                open={openMenu === "model"}
                onOpenChange={(open) => setOpenMenu(open ? "model" : null)}
                onChange={(value) =>
                  setModelId(value as CharacterGenerationModelId)
                }
              />
              <CharacterSelectMenu
                id="style"
                icon={Palette}
                label={style}
                options={characterStyleOptions.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={style}
                open={openMenu === "style"}
                onOpenChange={(open) => setOpenMenu(open ? "style" : null)}
                onChange={setStyle}
              />
              <button
                type="button"
                onClick={() => setPrompt("")}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Clear description"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-12 items-center rounded-xl border border-white/8 bg-[#17191d] px-3 text-white">
                <button
                  type="button"
                  onClick={() => setCount((value) => Math.max(1, value - 1))}
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Decrease character count"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-12 text-center text-lg font-semibold tabular-nums">
                  {count}/4
                </span>
                <button
                  type="button"
                  onClick={() => setCount((value) => Math.min(4, value + 1))}
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Increase character count"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  onGenerate({
                    description: prompt,
                    modelId,
                    style,
                    count,
                  })
                }
                disabled={generating || prompt.trim().length < 5}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-fuchsia-700 px-5 text-sm font-black text-white transition enabled:hover:bg-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {generating ? "Generating" : "Generate"}
                {generating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                <span className="font-black">{credits}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CharacterSelectMenuId = "model" | "style" | null;

function CharacterSelectMenu({
  id,
  icon: Icon,
  label,
  options,
  value,
  open,
  onOpenChange,
  onChange,
}: {
  id: Exclude<CharacterSelectMenuId, null>;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const gap = 8;
      const inset = 16;
      const width = Math.min(288, window.innerWidth - inset * 2);
      const itemHeight = 37;
      const desiredHeight = Math.min(options.length * itemHeight + 14, 560);
      const spaceBelow = window.innerHeight - rect.bottom - gap - inset;
      const spaceAbove = rect.top - gap - inset;
      const openDown = spaceBelow >= desiredHeight || spaceBelow >= spaceAbove;
      const maxHeight = Math.max(
        160,
        Math.min(desiredHeight, openDown ? spaceBelow : spaceAbove)
      );
      const left = Math.min(
        Math.max(inset, rect.left),
        window.innerWidth - width - inset
      );
      const top = openDown
        ? rect.bottom + gap
        : Math.max(inset, rect.top - gap - maxHeight);

      setMenuPosition({ left, top, width, maxHeight });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  return (
    <div className={cn("relative", open ? "z-[90]" : "z-40")}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          "inline-flex h-11 min-w-0 items-center gap-2 rounded-xl border px-3 text-sm font-black text-slate-200 shadow-sm transition hover:border-white/18 hover:bg-white/8 hover:text-white",
          open
            ? "border-white/28 bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.28)]"
            : "border-white/6 bg-white/4"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-character-menu`}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white/7">
          <Icon className="size-3.5 text-cyan-100" />
        </span>
        <span className="max-w-42 truncate">{label}</span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 text-slate-400 transition",
            open ? "rotate-180" : ""
          )}
        />
      </button>

      {open && menuPosition
        ? createPortal(
        <div
          ref={menuRef}
          id={`${id}-character-menu`}
          role="listbox"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
          }}
          className="fixed z-[9999] overflow-hidden rounded-2xl border border-white/14 bg-[#111317]/95 p-1.5 shadow-[0_26px_80px_rgba(0,0,0,0.62),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent" />
          <div
            className="relative overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.45)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-transparent"
            style={{ maxHeight: menuPosition.maxHeight - 12 }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
                className={cn(
                  "group flex min-h-9 w-full items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm font-bold text-slate-200 transition hover:border-white/12 hover:bg-white/8 hover:text-white",
                  value === option.value
                    ? "border-white/18 bg-white/14 text-white shadow-[0_10px_28px_rgba(0,0,0,0.24)]"
                    : "border border-transparent"
                )}
                role="option"
                aria-selected={value === option.value}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full transition",
                    value === option.value
                      ? "bg-fuchsia-400 text-white"
                      : "bg-white/0 text-transparent group-hover:bg-white/8"
                  )}
                >
                  <Check className="size-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>,
          document.body
        )
        : null}
    </div>
  );
}

function BuildCharacterModal({
  generating,
  onClose,
  onGenerate,
}: {
  generating: boolean;
  onClose: () => void;
  onGenerate: (input: {
    description?: string;
    style: string;
    vibe?: string;
    gender?: string;
    ethnicity?: string;
    ageRange?: string;
    count: number;
  }) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [count, setCount] = useState(4);
  const [customEthnicity, setCustomEthnicity] = useState("");
  const [extraDescription, setExtraDescription] = useState("");
  const [selections, setSelections] = useState<Partial<Record<BuilderStep, string>>>({});

  const step = builderSteps[stepIndex]?.id ?? "vibe";
  const currentOptions =
    step === "vibe"
      ? vibeOptions
      : step === "gender"
        ? genderOptions
        : step === "ethnicity"
          ? ethnicityOptions
          : step === "age"
            ? ageOptions
            : [];

  function selectOption(option: string) {
    setSelections((current) => ({ ...current, [step]: option }));
    setStepIndex((current) => Math.min(builderSteps.length - 1, current + 1));
  }

  function skipStep() {
    setStepIndex((current) => Math.min(builderSteps.length - 1, current + 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  return (
    <div className="relative h-[calc(100dvh-1.5rem)] w-full max-w-[21.5rem] overflow-hidden rounded-[1rem] border border-white/10 bg-[#0f1113] shadow-[0_30px_120px_rgba(0,0,0,0.68)] sm:h-[min(54rem,calc(100vh-1.5rem))] sm:max-w-[118rem]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_6%,rgba(255,104,245,0.95),rgba(183,65,213,0.34)_24%,rgba(55,22,70,0.18)_40%,transparent_58%),linear-gradient(180deg,rgba(25,16,31,0.36),#101214_70%)] sm:bg-[radial-gradient(circle_at_50%_0%,rgba(244,114,255,0.52),rgba(147,51,234,0.18)_18%,transparent_39%),linear-gradient(180deg,rgba(16,18,22,0.12),#111315_72%)]" />
      <div className="absolute inset-x-0 top-0 h-[18rem] bg-[radial-gradient(ellipse_at_50%_8%,rgba(255,255,255,0.48),rgba(244,114,255,0.28)_30%,transparent_64%)] blur-xl sm:h-96 sm:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.28),transparent_45%)]" />
      <div className="absolute inset-x-4 top-[16.5rem] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent sm:hidden" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-7 z-40 flex size-8 items-center justify-center rounded-full bg-white/10 text-slate-200 transition hover:bg-white/14 hover:text-white sm:right-5 sm:top-5 sm:size-13 sm:rounded-xl sm:bg-white/7"
        aria-label="Close"
      >
        <X className="size-4.5 sm:size-6" />
      </button>

      <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-5 sm:items-center sm:px-8 sm:pb-8 sm:pt-6">
        <BuilderStepper stepIndex={stepIndex} />

        <div
          className={cn(
            "flex min-h-0 w-full flex-1 flex-col sm:items-center sm:justify-center sm:pt-10",
            step === "check" ? "pt-[7.75rem]" : "pt-[12.5rem]"
          )}
        >
          {stepIndex > 0 ? (
            <SelectedChips selections={selections} />
          ) : null}

          {step !== "check" ? (
            <div className="relative w-full max-w-6xl">
              <button
                type="button"
                onClick={goBack}
                className={cn(
                  "absolute left-0 top-0 z-10 flex size-8 items-center justify-center rounded-xl bg-white/8 text-slate-300 shadow-[0_18px_44px_rgba(0,0,0,0.42)] transition hover:bg-white/14 hover:text-white sm:hidden lg:left-0 lg:top-1/2 lg:flex lg:size-11 lg:-translate-y-1/2",
                  stepIndex === 0 ? "pointer-events-none opacity-0" : ""
                )}
                aria-label="Previous step"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={skipStep}
                className="absolute right-0 top-0 rounded-xl bg-white/8 px-3 py-2 text-xs font-bold text-slate-300 shadow-[0_16px_44px_rgba(0,0,0,0.35)] transition hover:bg-white/14 hover:text-white sm:right-4 sm:px-4 sm:text-sm"
              >
                Skip
              </button>

              <h2 className="px-10 text-center text-base font-black text-white sm:text-xl">
                {step === "vibe"
                  ? "Select Look Vibe"
                  : step === "gender"
                    ? "Select Gender"
                    : step === "ethnicity"
                    ? "Select Ethnicity"
                      : "Select Age Range"}
              </h2>
              <div className="mx-auto mt-3 h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-white/18 to-transparent" />

              <div
                className={cn(
                  "-mx-4 mt-8 flex gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin] sm:mx-auto sm:grid sm:max-w-5xl sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0",
                  step === "gender"
                    ? "sm:grid-cols-3 lg:max-w-3xl"
                    : "sm:grid-cols-3 lg:grid-cols-5"
                )}
              >
                {currentOptions.map((option) => (
                  <BuilderOptionCard
                    key={option.label}
                    option={option}
                    selected={selections[step] === option.label}
                    onSelect={() => selectOption(option.label)}
                  />
                ))}
                {step === "ethnicity" ? (
                  <CustomEthnicityCard
                    value={customEthnicity}
                    onChange={setCustomEthnicity}
                    onApply={() => {
                      if (customEthnicity.trim()) {
                        selectOption(customEthnicity.trim());
                      }
                    }}
                  />
                ) : null}
              </div>

              {step === "vibe" ? (
                <div className="mx-auto mt-3 flex max-w-5xl items-center gap-2 text-slate-500">
                  <span className="text-xs">◂</span>
                  <div className="h-2 flex-1 rounded-full bg-white/20">
                    <div className="h-full w-2/3 rounded-full bg-white/30" />
                  </div>
                  <span className="text-xs">▸</span>
                </div>
              ) : null}
            </div>
          ) : (
            <BuilderCheckPanel
              count={count}
              generating={generating}
              extraDescription={extraDescription}
              selections={selections}
              onBack={goBack}
              onChangeCount={setCount}
              onClear={() => setExtraDescription("")}
              onDescriptionChange={setExtraDescription}
              onGenerate={() =>
                onGenerate({
                  description: extraDescription,
                  style: "Photorealistic",
                  vibe: selections.vibe,
                  gender: selections.gender,
                  ethnicity: selections.ethnicity,
                  ageRange: selections.age,
                  count,
                })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function BuilderStepper({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="relative mt-1 w-full rounded-full border border-white/22 bg-white/10 px-5 py-3.5 shadow-[0_0_54px_rgba(217,70,239,0.34)] backdrop-blur-md sm:max-w-2xl sm:px-7 sm:py-5 sm:shadow-[0_0_65px_rgba(217,70,239,0.42)]">
      <div className="absolute left-10 right-10 top-6 h-0.5 bg-white/18 sm:left-14 sm:right-14 sm:top-8 sm:bg-white/16" />
      <div className="relative grid grid-cols-5 gap-1 sm:gap-2">
        {builderSteps.map((item, index) => {
          const active = index <= stepIndex;
          return (
            <div key={item.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
              <span
                className={cn(
                  "size-2.5 rounded-full transition",
                  active ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.75)]" : "bg-white/25"
                )}
              />
              <span className="text-center text-[10px] font-black leading-tight text-white sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SelectedChips({
  selections,
}: {
  selections: Partial<Record<BuilderStep, string>>;
}) {
  const chips = (["vibe", "gender", "ethnicity", "age"] as BuilderStep[])
    .map((key) => ({ key, label: selections[key] }))
    .filter((chip): chip is { key: BuilderStep; label: string } => Boolean(chip.label));

  if (!chips.length) return null;

  return (
    <div className="mb-7 flex max-w-3xl flex-wrap justify-center gap-2 border-b border-white/14 pb-3 sm:mb-8">
      {chips.map((chip) => (
        <div
          key={chip.key}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-pink-100 px-2 pr-3 text-sm font-black text-zinc-950 shadow-[0_0_24px_rgba(244,114,182,0.68)] sm:h-11 sm:gap-2 sm:px-2.5 sm:pr-4 sm:text-base sm:shadow-[0_0_28px_rgba(244,114,182,0.75)]"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-sky-300 text-[10px] text-white sm:size-8 sm:text-xs">
            {chip.label.slice(0, 1)}
          </span>
          {chip.label}
        </div>
      ))}
    </div>
  );
}

function BuilderOptionCard({
  option,
  selected,
  onSelect,
}: {
  option: BuilderOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-[7.25rem] flex-none rounded-2xl border bg-white/[0.035] p-1.5 text-left transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.055] sm:w-auto sm:rounded-[1.15rem] sm:bg-white/[0.025]",
        selected
          ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_30px_rgba(217,70,239,0.65)]"
          : "border-white/10"
      )}
    >
      <div className={cn("relative h-[9.4rem] overflow-hidden rounded-[0.9rem] bg-gradient-to-br sm:h-[12.5rem]", option.tone)}>
        <Image
          src={option.image}
          alt={`${option.label} character style`}
          fill
          sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 36vw"
          className="object-cover object-center transition duration-500 group-hover:scale-105"
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t from-black/70 via-black/8 to-white/8", option.tone)} />
        {selected ? (
          <div className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-fuchsia-500 text-white shadow-[0_0_24px_rgba(217,70,239,0.75)]">
            <Check className="size-4" />
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          "px-1.5 py-2 text-center text-xs font-black leading-tight transition sm:px-2 sm:py-2.5 sm:text-sm",
          selected ? "text-white" : "text-slate-300 group-hover:text-white"
        )}
      >
        {option.label}
      </div>
    </button>
  );
}

function CustomEthnicityCard({
  value,
  onChange,
  onApply,
}: {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="w-[7.25rem] flex-none rounded-2xl border border-white/10 bg-white/[0.035] p-1.5 sm:w-auto sm:rounded-[1.15rem] sm:bg-white/[0.025]">
      <div className="relative h-[9.4rem] overflow-hidden rounded-[0.9rem] bg-white/[0.055] sm:h-[12.5rem]">
        {value ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Describe your idea"
            className="h-full w-full resize-none bg-transparent p-3 text-sm leading-5 text-white outline-none placeholder:text-slate-500"
          />
        ) : (
          <button
            type="button"
            onClick={() => onChange(" ")}
            className="grid h-full w-full place-items-center text-slate-400 transition hover:text-white"
            aria-label="Add custom ethnicity"
          >
            <Pencil className="size-8" />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onApply}
        className="w-full py-2 text-xs font-bold text-slate-400 transition hover:text-white sm:py-2.5 sm:text-sm"
      >
        {value ? "Apply" : "Custom"}
      </button>
    </div>
  );
}

function BuilderCheckPanel({
  count,
  generating,
  extraDescription,
  selections,
  onBack,
  onChangeCount,
  onClear,
  onDescriptionChange,
  onGenerate,
}: {
  count: number;
  generating: boolean;
  extraDescription: string;
  selections: Partial<Record<BuilderStep, string>>;
  onBack: () => void;
  onChangeCount: (value: number) => void;
  onClear: () => void;
  onDescriptionChange: (value: string) => void;
  onGenerate: () => void;
}) {
  const ready = Boolean(
    selections.vibe || selections.gender || selections.ethnicity || selections.age || extraDescription.trim()
  );

  return (
    <div className="relative w-full max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-xl bg-white/7 text-slate-300 transition hover:bg-white/12 hover:text-white lg:-left-24 lg:top-16 lg:size-10"
        aria-label="Previous step"
      >
        <ChevronLeft className="size-5" />
      </button>
      <h2 className="px-10 text-center text-base font-bold text-white sm:text-lg">
        Additional Description{" "}
        <span className="rounded-full bg-white/8 px-2 py-1 text-xs font-semibold text-slate-400">
          Optional
        </span>
      </h2>

      <div className="relative mx-auto mt-5 max-w-xl sm:mt-8">
        <textarea
          value={extraDescription}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Sample: brown curly short hair, a few wrinkles on his forehead, and a full beard."
          className="h-33 w-full resize-none rounded-xl border border-white/8 bg-[#25282b] px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-primary/50 sm:h-38"
        />
        <button
          type="button"
          onClick={onClear}
          className="absolute bottom-3 left-3 flex size-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
          aria-label="Clear additional description"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mx-auto mt-3 flex max-w-xl flex-row gap-2 sm:mt-4">
        <div className="flex h-11 w-[7.25rem] shrink-0 items-center rounded-xl border border-white/8 bg-[#17191d] px-2 text-white sm:h-13 sm:w-auto sm:px-3">
          <button
            type="button"
            onClick={() => onChangeCount(Math.max(1, count - 1))}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Decrease character count"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-10 text-center text-base font-semibold tabular-nums sm:min-w-12 sm:text-lg">
            {count}/4
          </span>
          <button
            type="button"
            onClick={() => onChangeCount(Math.min(4, count + 1))}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Increase character count"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || !ready}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-fuchsia-500 px-3 text-sm font-black text-white shadow-[0_5px_0_rgba(134,25,143,0.9)] transition enabled:hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-55 sm:h-13 sm:gap-2 sm:px-6 sm:shadow-[0_6px_0_rgba(134,25,143,0.9)]"
        >
          {generating ? "Generating" : "Generate"}
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          <span className="font-black">{getCharacterGenerationCost(count)}</span>
        </button>
      </div>
    </div>
  );
}

function CharacterSilhouette({ variant }: { variant: "full" | "portrait" | "profile" }) {
  if (variant === "profile") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-44 w-28">
          <div className="absolute left-8 top-4 size-16 rounded-full bg-black/85" />
          <div className="absolute left-12 top-16 h-28 w-13 rounded-[50%] bg-black/88" />
          <div className="absolute left-6 top-20 h-20 w-22 rounded-full bg-black/80 blur-sm" />
        </div>
      </div>
    );
  }

  if (variant === "portrait") {
    return (
      <div className="absolute inset-0 flex items-end justify-center">
        <div className="relative h-46 w-28">
          <div className="absolute left-1/2 top-2 size-18 -translate-x-1/2 rounded-full bg-black/88" />
          <div className="absolute bottom-0 left-1/2 h-32 w-28 -translate-x-1/2 rounded-t-full bg-black/90" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-end justify-center">
      <div className="relative h-52 w-24">
        <div className="absolute left-1/2 top-0 size-12 -translate-x-1/2 rounded-full bg-black/85" />
        <div className="absolute left-1/2 top-11 h-28 w-18 -translate-x-1/2 rounded-t-[2rem] bg-black/82" />
        <div className="absolute bottom-0 left-5 h-24 w-5 rounded-full bg-black/86" />
        <div className="absolute bottom-0 right-5 h-24 w-5 rounded-full bg-black/86" />
      </div>
    </div>
  );
}

function StartFromImageModal({
  imagePreview,
  imageFile,
  generating,
  fileInputRef,
  onClose,
  onBack,
  onClearImage,
  onPickImage,
  onGenerate,
}: {
  imagePreview: string | null;
  imageFile: File | null;
  generating: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onBack: () => void;
  onClearImage: () => void;
  onPickImage: (file?: File) => void;
  onGenerate: (input: {
    name: string;
    backgroundStory?: string;
    imageFile: File | null;
    count: number;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [backgroundStory, setBackgroundStory] = useState("");

  return (
    <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[#151819] shadow-[0_30px_120px_rgba(0,0,0,0.62)] sm:rounded-[1.1rem]">
      <div className="flex h-13 items-center justify-between border-b border-white/8 px-3 sm:h-15 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/5 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <h2 className="text-base font-bold text-white sm:text-lg">Create Character</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="grid gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[1fr_20rem]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative min-h-[14.5rem] overflow-hidden rounded-[1rem] border border-dashed border-fuchsia-500/75 bg-[#101214] text-left transition hover:border-fuchsia-300/90 sm:min-h-[22rem] lg:min-h-[25rem]"
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Character reference preview"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-contain p-4"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <div>
                <div className="mx-auto flex items-center justify-center gap-2">
                  <TiltedImageIcon className="-rotate-12" />
                  <TiltedImageIcon className="scale-110" />
                  <TiltedImageIcon className="rotate-12" />
                </div>
                <p className="mt-4 text-sm font-bold text-white sm:mt-5 sm:text-base">
                  Add Front-Facing Image
                </p>
                <p className="mt-1.5 text-xs text-slate-500 sm:mt-2 sm:text-sm">
                  Click or drag to upload / choose from{" "}
                  <span className="underline underline-offset-3">History</span>
                </p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => onPickImage(event.target.files?.[0])}
          />
        </button>

        <div className="rounded-[1rem] border border-white/8 bg-white/[0.055] p-3 sm:p-4">
          <label className="block text-sm font-bold text-white" htmlFor="character-name">
            Name
          </label>
          <input
            id="character-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter character name"
            className="mt-3 h-10 w-full rounded-lg border border-white/8 bg-white/7 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/60 sm:mt-4 sm:h-11 sm:px-4"
          />

          <label className="mt-5 block text-sm font-bold text-white sm:mt-8" htmlFor="character-story">
            Background Story{" "}
            <span className="rounded-full bg-white/8 px-2 py-1 text-xs font-semibold text-slate-400">
              Optional
            </span>
          </label>
          <div className="relative mt-3 sm:mt-4">
            <textarea
              id="character-story"
              value={backgroundStory}
              onChange={(event) => setBackgroundStory(event.target.value)}
              placeholder="Tell us about your character's story..."
              className="h-24 w-full resize-none rounded-lg border border-white/8 bg-white/7 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/60 sm:h-36 sm:px-4 sm:py-4"
            />
            <button
              type="button"
              className="absolute bottom-3 left-3 flex size-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
              onClick={onClearImage}
              aria-label="Clear image"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onGenerate({
                name,
                backgroundStory,
                imageFile,
                count: 1,
              })
            }
            disabled={!imagePreview || !imageFile || generating}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 text-sm font-bold text-white transition enabled:hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-55 sm:mt-5 sm:h-12"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TiltedImageIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-14 items-center justify-center rounded-2xl bg-white/8 text-slate-300",
        className
      )}
    >
      <ImagePlus className="size-7" />
    </span>
  );
}

function UsersIcon() {
  return <Upload className="size-7" />;
}
