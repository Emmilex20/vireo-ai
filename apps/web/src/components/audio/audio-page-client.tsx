"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Gauge,
  ListFilter,
  Loader2,
  Mic2,
  MoreVertical,
  Play,
  RefreshCw,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Volume2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type VoicePreset = {
  id: string;
  name: string;
  description: string;
  accent: string;
  gender: "Male" | "Female" | "Neutral";
  age: "Child" | "Teen" | "Young Adult" | "Adult" | "Middle Aged" | "Senior";
  usecase: string;
  accentClass: string;
};

type AudioResult = {
  id: string;
  title: string;
  prompt: string;
  voiceId: string;
  modelId: string;
  duration: string;
  createdAt: string;
  outputUrl?: string | null;
  status?: "processing" | "completed" | "failed";
  settings?: unknown;
};

type AudioDraft = {
  prompt?: string;
  selectedModelId?: string;
  selectedVoiceId?: string;
  speed?: number;
  stability?: number;
  similarity?: number;
  style?: number;
  volume?: number;
  pitch?: number;
  tone?: number;
  intensity?: number;
  timbre?: number;
};

type AudioModelOption = {
  id: string;
  name: string;
  description: string;
  provider: string;
  badge?: string;
  credits: number;
  controls: "none" | "eleven" | "minimax";
};

type PromptPreset = {
  label: string;
  prompt: string;
};

const audioModels: AudioModelOption[] = [
  {
    id: "elevenlabs/v3",
    name: "Eleven v3",
    description: "Natural speech with high emotional range.",
    provider: "ElevenLabs",
    badge: "Premium",
    credits: 15,
    controls: "none",
  },
  {
    id: "elevenlabs/v2-multilingual",
    name: "Eleven Multilingual v2",
    description: "High-quality multilingual voice-over generation.",
    provider: "ElevenLabs",
    badge: "Popular",
    credits: 15,
    controls: "eleven",
  },
  {
    id: "minimax/speech-2.8-hd",
    name: "MiniMax Speech 2.8 HD",
    description: "High-definition text-to-speech with fine-grained voice control.",
    provider: "MiniMax",
    badge: "HD",
    credits: 15,
    controls: "minimax",
  },
  {
    id: "minimax/speech-2.8-turbo",
    name: "MiniMax Speech 2.8 Turbo",
    description: "Fast, cost-effective text-to-speech with fine-grained voice control.",
    provider: "MiniMax",
    credits: 10,
    controls: "minimax",
  },
];

const defaultVoiceOptions: VoicePreset[] = [
  {
    id: "Rachel",
    name: "Rachel",
    description: "Rachel is an ElevenLabs female voice for polished narration reads.",
    accent: "English",
    gender: "Female",
    age: "Adult",
    usecase: "Narration",
    accentClass: "from-fuchsia-200 to-violet-400",
  },
  {
    id: "Aria",
    name: "Aria",
    description: "Aria is an ElevenLabs female voice for polished narration reads.",
    accent: "English",
    gender: "Female",
    age: "Adult",
    usecase: "Narration",
    accentClass: "from-sky-200 to-cyan-400",
  },
  {
    id: "Clyde",
    name: "Clyde",
    description: "Clyde is an ElevenLabs male voice for polished narration reads.",
    accent: "English",
    gender: "Male",
    age: "Adult",
    usecase: "Narration",
    accentClass: "from-emerald-200 to-teal-400",
  },
];

const PROMPT_PRESET_BATCH_SIZE = 4;

const promptPresets: PromptPreset[] = [
  {
    label: "Product Demo",
    prompt:
      "Meet Vireon AI. A premium creative studio for images, videos, characters, worlds, and voice. One idea goes in. A finished creative direction comes out.",
  },
  {
    label: "Film Teaser",
    prompt:
      "The signal arrived at midnight. No sender. No message. Just one frame of a city that did not exist, and somehow, I remembered walking through it.",
  },
  {
    label: "Skill Tutorial",
    prompt:
      "Start with the subject. Add the mood. Choose the camera angle. Then describe the light. A good prompt is not longer. It is clearer.",
  },
  {
    label: "Brand Story",
    prompt:
      "We built Vireon for the moment between imagination and execution. The place where creators need speed, control, and enough quiet to make the idea real.",
  },
  {
    label: "Dream Loop",
    prompt:
      "Every night, I return to the same dream. A street I have never walked, a signal I somehow recognize, and a door that opens only when I stop running.",
  },
  {
    label: "Ad Teaser",
    prompt:
      "Less waiting. More making. Vireon gives every creator a faster way to shape the image, direct the scene, and finish the story.",
  },
  {
    label: "Podcast Intro",
    prompt:
      "Welcome back to the studio. Today, we are talking about creative work, useful tools, and the small decisions that turn rough ideas into finished things.",
  },
  {
    label: "Creator Bio",
    prompt:
      "I create cinematic portraits, surreal worlds, and visual stories shaped by fashion, movement, and light. Every piece begins with a question: what should this feeling look like?",
  },
  {
    label: "Launch Trailer",
    prompt:
      "A new studio is opening. Faster than the blank page. Sharper than the first draft. Built for creators who are ready to see the impossible take shape.",
  },
  {
    label: "Calm Guide",
    prompt:
      "Take one simple idea. Choose a visual mood. Add a few details about light, style, and composition. Now breathe. The first version does not need to be perfect.",
  },
  {
    label: "Mystery Hook",
    prompt:
      "At midnight, every window in the city went dark except one. Inside it, someone was watching a video of tomorrow.",
  },
  {
    label: "Fashion Spot",
    prompt:
      "Neon on wet pavement. Glass catching every flash of movement. This is streetwear for the nights that do not ask permission.",
  },
  {
    label: "SaaS Explainer",
    prompt:
      "Bring your campaign into one workspace. Generate assets, compare variations, organize the strongest ideas, and move from rough concept to final output without losing momentum.",
  },
  {
    label: "Tutorial Hook",
    prompt:
      "If your prompt feels flat, do not add more words yet. Add better direction. Subject, mood, camera, light, and texture. That is where the image begins to listen.",
  },
  {
    label: "Film Noir",
    prompt:
      "By the time I found the photograph, the crime had not happened yet. That was the problem with this city. The evidence always arrived first.",
  },
  {
    label: "Luxury Watch",
    prompt:
      "Black ceramic. Quiet movement. Light passing over every curve with precision. A watch designed for people who do not need to announce the room they command.",
  },
  {
    label: "Travel Reel",
    prompt:
      "I arrived before the city woke up. A camera, a notebook, and a coastline turning gold. Some journeys begin softly, then stay with you forever.",
  },
  {
    label: "Worldbuilding",
    prompt:
      "The city floats above the clouds, powered by memory engines. Artists trade sketches for weather, gravity bends around galleries, and music lights the streets.",
  },
  {
    label: "Game Trailer",
    prompt:
      "The arena is alive. Every wall can shift. Every sound can become a weapon. Step in, move fast, and reshape the map before it reshapes you.",
  },
  {
    label: "Character Intro",
    prompt:
      "She never raised her voice. She never missed a detail. And when the city finally broke open, she was the only one who knew where the light was hidden.",
  },
  {
    label: "Motivational",
    prompt:
      "You do not need to feel ready to begin. You only need one honest attempt. Make the small version. Then make the next one better.",
  },
  {
    label: "App Walkthrough",
    prompt:
      "Choose your model. Write the idea. Adjust the controls. Generate the first version, save what works, and keep building from there.",
  },
  {
    label: "Documentary",
    prompt:
      "For years, cinematic production belonged to large studios. Now, independent creators are building worlds from laptops, prompts, references, and a new generation of visual tools.",
  },
  {
    label: "Hero Scene",
    prompt:
      "Through smoke and silver rain, he walked toward the city gate. No army behind him. No promise of return. Just the light calling his name.",
  },
  {
    label: "ASMR Soft",
    prompt:
      "Open the studio slowly. Let the rain soften the room. Choose one color, one shape, one image. There is no rush here. Only the next quiet decision.",
  },
  {
    label: "News Brief",
    prompt:
      "Today, Vireon announced a major update to its creative suite, bringing faster generation, stronger model controls, improved asset organization, and smoother collaboration for visual teams.",
  },
  {
    label: "Course Promo",
    prompt:
      "Learn how to turn ideas into visual stories with better prompts, stronger references, cleaner composition, and workflows you can use on your next project.",
  },
  {
    label: "Pitch Deck",
    prompt:
      "Creative production is changing. Teams need more content, faster iteration, and better control. Vireon brings image, video, audio, and character generation into one focused workspace.",
  },
  {
    label: "Real Estate",
    prompt:
      "Set above the city, this hillside home balances warm interiors, wide glass, and quiet luxury. Every room is designed around light, privacy, and the view.",
  },
  {
    label: "Food Ad",
    prompt:
      "Steam rises under neon light. Sesame oil hits the bowl. The room gets quiet for one perfect second. This is ramen worth staying out late for.",
  },
  {
    label: "Fitness Promo",
    prompt:
      "Your training should move with you. Adapt to your schedule, your recovery, and your goals. Show up today, and let the plan meet you there.",
  },
  {
    label: "Music Tag",
    prompt: "Vireon Studio. Create the frame. Shape the sound. Build the world.",
  },
  {
    label: "Museum Guide",
    prompt:
      "In this portrait, the light falls softly from the left, revealing not only the subject's face, but the quiet tension behind their expression.",
  },
  {
    label: "Fantasy Tale",
    prompt:
      "The cartographer did not map kingdoms. He mapped dreams for royalty. But one morning, a dream moved on the page while everyone was awake.",
  },
  {
    label: "Sci-Fi Log",
    prompt:
      "Captain's log, day one hundred and twelve. The station is silent. Every screen shows tomorrow's arrival, but none of the recordings agree on who survives.",
  },
  {
    label: "Customer Story",
    prompt:
      "By noon, the team had a campaign idea. By three, they had image concepts, video directions, character references, and a polished audio read. That is what momentum feels like.",
  },
  {
    label: "Social Hook",
    prompt:
      "Stop making your prompts longer. Make them clearer. Tell the model what to see, how to light it, and what feeling should survive the frame.",
  },
  {
    label: "Meditation",
    prompt:
      "Take a breath. Notice the idea without judging it. Let the pressure fall away. You only need one simple next action.",
  },
  {
    label: "Cyberpunk",
    prompt:
      "Under holographic rain, the market sold memories as moving posters. I bought one for a life I never lived, and it recognized me immediately.",
  },
  {
    label: "Kids Story",
    prompt:
      "Every time someone tried again, the tiny robot painted a new star in the sky. By morning, the whole town was glowing.",
  },
  {
    label: "Investor Update",
    prompt:
      "This quarter, Vireon improved generation speed, expanded creative workflows, strengthened infrastructure, and saw creators return more often to finish larger projects.",
  },
  {
    label: "Voice Ad",
    prompt:
      "Turn your script into realistic narration. Choose the model, pick the voice, adjust the controls, and save the final audio inside your studio.",
  },
  {
    label: "Morning Reel",
    prompt:
      "Coffee on the desk. Light through the curtains. One open project. One idea worth starting before the day gets too loud.",
  },
  {
    label: "Dramatic Monologue",
    prompt:
      "If this world is only a rendering, then let it render me brave. These people are real enough to love, and that is real enough to protect.",
  },
  {
    label: "Founder Note",
    prompt:
      "Vireon is for creators who want powerful tools without noise. A focused studio where ideas move faster, choices stay clear, and the work remains yours.",
  },
  {
    label: "Event Opener",
    prompt:
      "Welcome to a showcase of AI films, character worlds, cinematic tools, and independent creators pushing visual storytelling into new territory.",
  },
  {
    label: "Radio Drama",
    prompt:
      "The caller's voice trembled over the midnight signal. She said the photograph changed whenever I looked away. Then the line went silent.",
  },
  {
    label: "Short Poetic",
    prompt:
      "Light moves first. Then memory follows. Somewhere between the frame and the feeling, an idea becomes visible for the first time.",
  },
  {
    label: "Comedy Skit",
    prompt:
      "I asked for a simple product shot. The model gave me thunder, a prophecy, and a man standing on a cliff holding shampoo like it could save humanity.",
  },
  {
    label: "Architecture",
    prompt:
      "Concrete, glass, and quiet trees. This studio is built around natural light, water reflections, and the rare luxury of space that knows when to be silent.",
  },
  {
    label: "Beauty Ad",
    prompt:
      "Soft texture. Luminous skin. Movement that feels effortless. Beauty is not about hiding the person. It is about letting the light find them.",
  },
  {
    label: "Sports Hype",
    prompt:
      "Before the lights, there is discipline. Before the crowd, there is repetition. And when the moment arrives, preparation becomes instinct.",
  },
];

const initialResults: AudioResult[] = [
  {
    id: "sample-vireon",
    title: "Vireon product intro",
    prompt:
      "Meet Vireon AI, your AI-powered assistant for image editing, video creation, character design, and cinematic studio workflows.",
    voiceId: "nova",
    modelId: "elevenlabs/v2-multilingual",
    duration: "0:38",
    createdAt: "This Month",
    status: "completed",
  },
  {
    id: "sample-trailer",
    title: "Mystery trailer read",
    prompt:
      "In a city made of reflections, one creator learns that every image remembers who made it.",
    voiceId: "atlas",
    modelId: "minimax/speech-2.8-turbo",
    duration: "0:24",
    createdAt: "April",
    status: "completed",
  },
];

const AUDIO_DRAFT_STORAGE_KEY = "vireon:audio-studio:draft";

function getInitialPromptPresetBatch() {
  return promptPresets.slice(0, PROMPT_PRESET_BATCH_SIZE);
}

function shufflePromptPresetBatch(currentLabels: string[]) {
  const currentLabelSet = new Set(currentLabels);
  const pool = promptPresets.filter((preset) => !currentLabelSet.has(preset.label));
  const source = pool.length >= PROMPT_PRESET_BATCH_SIZE ? pool : promptPresets;

  return [...source]
    .sort(() => Math.random() - 0.5)
    .slice(0, PROMPT_PRESET_BATCH_SIZE);
}

function loadAudioDraft(): AudioDraft {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(AUDIO_DRAFT_STORAGE_KEY) ?? "{}"
    ) as AudioDraft;
  } catch {
    return {};
  }
}

function persistedNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function AudioPageClient({
  initialResults: userInitialResults = [],
}: {
  initialResults?: AudioResult[];
}) {
  const [prompt, setPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(audioModels[1].id);
  const [selectedVoiceId, setSelectedVoiceId] = useState(defaultVoiceOptions[0].id);
  const [voiceOptions, setVoiceOptions] = useState<VoicePreset[]>(defaultVoiceOptions);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [voiceFilters, setVoiceFilters] = useState({
    accent: "All",
    gender: "All",
    age: "All",
    usecase: "All",
  });
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const [style, setStyle] = useState(0.21);
  const [volume, setVolume] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [tone, setTone] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [timbre, setTimbre] = useState(0);
  const [results, setResults] = useState<AudioResult[]>(() =>
    userInitialResults.length ? userInitialResults : initialResults
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [voicePreviewUrls, setVoicePreviewUrls] = useState<Record<string, string>>({});
  const [visiblePromptPresets, setVisiblePromptPresets] = useState<PromptPreset[]>(
    getInitialPromptPresetBatch
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedVoice = useMemo(
    () =>
      voiceOptions.find((voice) => voice.id === selectedVoiceId) ??
      defaultVoiceOptions[0],
    [selectedVoiceId, voiceOptions]
  );
  const selectedModel = useMemo(
    () => audioModels.find((model) => model.id === selectedModelId) ?? audioModels[1],
    [selectedModelId]
  );

  const canGenerate = prompt.trim().length > 0 && !isGenerating;
  const estimatedDuration = Math.max(8, Math.ceil(prompt.trim().split(/\s+/).filter(Boolean).length / 2.4));
  const filteredVoiceOptions = useMemo(
    () =>
      voiceOptions.filter(
        (voice) =>
          (voiceFilters.accent === "All" || voice.accent === voiceFilters.accent) &&
          (voiceFilters.gender === "All" || voice.gender === voiceFilters.gender) &&
          (voiceFilters.age === "All" || voice.age === voiceFilters.age) &&
          (voiceFilters.usecase === "All" || voice.usecase === voiceFilters.usecase)
      ),
    [voiceFilters, voiceOptions]
  );
  const voiceFilterOptions = useMemo(
    () => ({
      accent: ["All", ...Array.from(new Set(voiceOptions.map((voice) => voice.accent))).sort()],
      gender: ["All", ...Array.from(new Set(voiceOptions.map((voice) => voice.gender))).sort()],
      age: ["All", ...Array.from(new Set(voiceOptions.map((voice) => voice.age))).sort()],
      usecase: ["All", ...Array.from(new Set(voiceOptions.map((voice) => voice.usecase))).sort()],
    }),
    [voiceOptions]
  );

  useEffect(() => {
    queueMicrotask(() => {
      const draft = loadAudioDraft();
      setPrompt(draft.prompt ?? "");
      setSelectedModelId(draft.selectedModelId ?? audioModels[1].id);
      setSelectedVoiceId(draft.selectedVoiceId ?? defaultVoiceOptions[0].id);
      setSpeed(persistedNumber(draft.speed, 1));
      setStability(persistedNumber(draft.stability, 0.5));
      setSimilarity(persistedNumber(draft.similarity, 0.75));
      setStyle(persistedNumber(draft.style, 0.21));
      setVolume(persistedNumber(draft.volume, 1));
      setPitch(persistedNumber(draft.pitch, 0));
      setTone(persistedNumber(draft.tone, 0));
      setIntensity(persistedNumber(draft.intensity, 0));
      setTimbre(persistedNumber(draft.timbre, 0));
      setHasRestoredDraft(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setIsLoadingVoices(true);
      fetch(`/api/audio/voices?modelId=${encodeURIComponent(selectedModelId)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load voices");
          }

          return response.json() as Promise<{ voices?: VoicePreset[] }>;
        })
        .then((data) => {
          if (cancelled) return;

          const nextVoices = data.voices?.length ? data.voices : defaultVoiceOptions;
          setVoiceOptions(nextVoices);
          setSelectedVoiceId((current) =>
            nextVoices.some((voice) => voice.id === current)
              ? current
              : nextVoices[0]?.id ?? current
          );
          setVoiceFilters({
            accent: "All",
            gender: "All",
            age: "All",
            usecase: "All",
          });
        })
        .catch(() => {
          if (cancelled) return;
          setVoiceOptions(defaultVoiceOptions);
          setSelectedVoiceId((current) =>
            defaultVoiceOptions.some((voice) => voice.id === current)
              ? current
              : defaultVoiceOptions[0].id
          );
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoadingVoices(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [selectedModelId]);

  useEffect(() => {
    if (!hasRestoredDraft) {
      return;
    }

    window.localStorage.setItem(
      AUDIO_DRAFT_STORAGE_KEY,
      JSON.stringify({
        prompt,
        selectedModelId,
        selectedVoiceId,
        speed,
        stability,
        similarity,
        style,
        volume,
        pitch,
        tone,
        intensity,
        timbre,
      })
    );
  }, [
    prompt,
    selectedModelId,
    selectedVoiceId,
    speed,
    stability,
    similarity,
    style,
    volume,
    pitch,
    tone,
    intensity,
    timbre,
    hasRestoredDraft,
  ]);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    },
    []
  );

  function playAudioUrl(url: string, playbackId: string) {
    window.speechSynthesis?.cancel();

    if (playingId === playbackId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    setPlayingId(playbackId);
    void audio.play();
  }

  function speak(text: string, resultId: string, voice: VoicePreset) {
    const result = results.find((item) => item.id === resultId);
    if (result?.outputUrl) {
      playAudioUrl(result.outputUrl, resultId);
      return;
    }

    if (!("speechSynthesis" in window)) {
      globalThis.alert("Voice preview is not supported in this browser yet.");
      return;
    }

    window.speechSynthesis.cancel();

    if (playingId === resultId) {
      setPlayingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.min(1.4, Math.max(0.6, speed));
    utterance.pitch = Math.min(
      1.6,
      Math.max(0.4, 1 + (voice.gender === "Female" ? 0.1 : -0.05) + style * 0.28)
    );
    utterance.volume = 1;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    setPlayingId(resultId);
    window.speechSynthesis.speak(utterance);
  }

  async function previewVoice(voice: VoicePreset) {
    const playbackId = `preview:${selectedModelId}:${voice.id}`;
    const cachedPreviewUrl = voicePreviewUrls[playbackId];

    if (cachedPreviewUrl) {
      playAudioUrl(cachedPreviewUrl, playbackId);
      return;
    }

    setPreviewingVoiceId(voice.id);
    try {
      const response = await fetch("/api/audio/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: selectedModelId,
          voiceId: voice.id,
          speed: selectedModel.controls === "none" ? undefined : speed,
          stability: selectedModel.controls === "eleven" ? stability : undefined,
          similarityBoost: selectedModel.controls === "eleven" ? similarity : undefined,
          style: selectedModel.controls === "eleven" ? style : undefined,
          volume: selectedModel.controls === "minimax" ? volume : undefined,
          pitch: selectedModel.controls === "minimax" ? pitch : undefined,
          tone: selectedModel.controls === "minimax" ? tone : undefined,
          intensity: selectedModel.controls === "minimax" ? intensity : undefined,
          timbre: selectedModel.controls === "minimax" ? timbre : undefined,
        }),
      });
      const data = (await response.json()) as {
        outputUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.outputUrl) {
        globalThis.alert(data.error ?? "Failed to generate voice preview.");
        return;
      }

      setVoicePreviewUrls((current) => ({
        ...current,
        [playbackId]: data.outputUrl!,
      }));
      playAudioUrl(data.outputUrl, playbackId);
    } finally {
      setPreviewingVoiceId(null);
    }
  }

  async function pollAudioJob(jobId: string, resultId: string) {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await fetch(`/api/generate/status/${jobId}`);
      if (!response.ok) continue;

      const data = (await response.json()) as {
        status?: string;
        outputUrl?: string | null;
        failureReason?: string | null;
        settings?: unknown;
      };

      if (data.status === "completed" && data.outputUrl) {
        setResults((current) =>
          current.map((item) =>
            item.id === resultId
              ? {
                  ...item,
                  status: "completed",
                  outputUrl: data.outputUrl,
                  settings: data.settings ?? item.settings,
                }
              : item
          )
        );
        return;
      }

      if (data.status === "failed") {
        setResults((current) =>
          current.map((item) =>
            item.id === resultId ? { ...item, status: "failed" } : item
          )
        );
        globalThis.alert(data.failureReason || "Audio generation failed.");
        return;
      }
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      for (const result of results) {
        if (result.status === "processing" && !result.id.startsWith("audio-")) {
          void pollAudioJob(result.id, result.id);
        }
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // Only resume polling server-backed jobs from the initial database payload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    if (!canGenerate) {
      return;
    }

    setIsGenerating(true);
    try {
      const words = prompt.trim().split(/\s+/).filter(Boolean);
      const title = words.slice(0, 5).join(" ") || "Untitled voice-over";
      const optimisticId = `audio-${Date.now()}`;

      setResults((current) => [
        {
          id: optimisticId,
          title,
          prompt: prompt.trim(),
          voiceId: selectedVoiceId,
          modelId: selectedModelId,
          duration: `0:${String(Math.min(59, estimatedDuration)).padStart(2, "0")}`,
          createdAt: "Just now",
          status: "processing",
          settings: {
            voiceId: selectedVoice.id,
            controls: selectedModel.controls,
          },
        },
        ...current,
      ]);

      const response = await fetch("/api/generate/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelId: selectedModelId,
          voiceId: selectedVoice.id,
          speed: selectedModel.controls === "none" ? undefined : speed,
          stability: selectedModel.controls === "eleven" ? stability : undefined,
          similarityBoost: selectedModel.controls === "eleven" ? similarity : undefined,
          style: selectedModel.controls === "eleven" ? style : undefined,
          volume: selectedModel.controls === "minimax" ? volume : undefined,
          pitch: selectedModel.controls === "minimax" ? pitch : undefined,
          tone: selectedModel.controls === "minimax" ? tone : undefined,
          intensity: selectedModel.controls === "minimax" ? intensity : undefined,
          timbre: selectedModel.controls === "minimax" ? timbre : undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        jobId?: string;
        status?: string;
        outputUrl?: string | null;
        failureReason?: string | null;
        meta?: {
          settings?: unknown;
        };
      };

      if (!response.ok) {
        setResults((current) => current.filter((item) => item.id !== optimisticId));
        globalThis.alert(data.message || data.error || "Failed to create audio job.");
        return;
      }

      if (data.status === "completed" && data.outputUrl) {
        setResults((current) =>
          current.map((item) =>
            item.id === optimisticId
              ? {
                  ...item,
                  id: data.jobId ?? item.id,
                  status: "completed",
                  outputUrl: data.outputUrl,
                  settings: data.meta?.settings ?? item.settings,
                }
              : item
          )
        );
        return;
      }

      if (data.status === "failed") {
        setResults((current) => current.filter((item) => item.id !== optimisticId));
        globalThis.alert(data.failureReason || "Audio generation failed.");
        return;
      }

      if (data.jobId) {
        setResults((current) =>
          current.map((item) =>
            item.id === optimisticId ? { ...item, id: data.jobId!, status: "processing" } : item
          )
        );
        void pollAudioJob(data.jobId, data.jobId);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopyPrompt(text: string) {
    void navigator.clipboard.writeText(text);
  }

  function shufflePromptPresets() {
    setVisiblePromptPresets((current) =>
      shufflePromptPresetBatch(current.map((preset) => preset.label))
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#07090b] px-3 py-3 text-white lg:px-5 lg:py-4">
      <div className="grid min-h-[calc(100vh-6.5rem)] gap-2.5 lg:grid-cols-[29.5rem_minmax(0,1fr)] xl:grid-cols-[31rem_minmax(0,1fr)]">
        <section className="hidden overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#151719] lg:flex lg:flex-col">
          <div className="flex h-13 items-center gap-2.5 border-b border-white/8 px-3.5">
            <Link
              href="/"
              className="flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/8 hover:text-white"
              aria-label="Back"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <div>
              <p className="text-base font-bold tracking-tight">Create voice-over</p>
              <p className="text-xs text-slate-500">Audio studio</p>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
            <ControlCard className="p-2.5">
              <button
                type="button"
                onClick={() => setShowModelPicker(true)}
                className="flex w-full items-center justify-between rounded-[1rem] bg-white/[0.03] p-2.5 text-left transition hover:bg-white/[0.055]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/7 text-white">
                    <AudioLines className="size-4.5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Audio Model
                    </span>
                    <span className="block text-[13px] font-bold text-white">{selectedModel.name}</span>
                  </span>
                </span>
                <ChevronDown className="size-4 text-slate-500" />
              </button>
            </ControlCard>

            <ControlCard>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-white">Prompt</p>
                  <p className="mt-1 text-xs text-slate-500">Write the script you want spoken.</p>
                </div>
                <span className="rounded-full bg-white/7 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  {prompt.length}/10,000
                </span>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101214]">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value.slice(0, 10000))}
                  placeholder="Enter your voice-over prompt..."
                  className="min-h-38 w-full resize-none bg-transparent px-3.5 py-3.5 text-[13px] leading-5 text-white outline-none placeholder:text-slate-600"
                />
                <div className="flex items-center border-t border-white/7 px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setPrompt("")}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-white"
                    aria-label="Clear prompt"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                {visiblePromptPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPrompt(preset.prompt)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/10 px-2.5 text-[11px] font-semibold text-slate-400 transition hover:border-primary/35 hover:bg-primary/10 hover:text-white"
                  >
                    <FileText className="size-3.5" />
                    {preset.label}
                  </button>
                ))}
                </div>
                <button
                  type="button"
                  onClick={shufflePromptPresets}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-white"
                  aria-label="Shuffle prompt ideas"
                >
                  <RefreshCw className="size-4" />
                </button>
              </div>
            </ControlCard>

            <ControlCard>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-white">Voice</p>
                  <p className="mt-1 text-xs text-slate-500">Pick a real voice from the selected model.</p>
                </div>
                <button
                  type="button"
                  onClick={() => previewVoice(selectedVoice)}
                  disabled={previewingVoiceId === selectedVoice.id}
                  className="inline-flex h-8 items-center gap-2 rounded-lg bg-white/7 px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  {previewingVoiceId === selectedVoice.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  {playingId === `preview:${selectedModelId}:${selectedVoice.id}` ? "Playing" : "Preview"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowVoicePicker(true)}
                className="flex w-full items-center justify-between rounded-[1rem] border border-white/10 bg-white/[0.025] p-2.5 text-left transition hover:border-primary/35 hover:bg-white/[0.05]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white",
                      selectedVoice.accentClass
                    )}
                  >
                    {selectedVoice.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-white">
                      {selectedVoice.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {selectedVoice.accent} · {selectedVoice.gender} · {selectedVoice.age} · {selectedVoice.usecase}
                    </span>
                  </span>
                </span>
                {isLoadingVoices ? (
                  <Loader2 className="size-4 animate-spin text-slate-500" />
                ) : (
                  <ChevronDown className="-rotate-90 size-4 text-slate-500" />
                )}
              </button>
            </ControlCard>

            {selectedModel.controls === "eleven" ? (
              <ControlCard>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-white">Voice Control</p>
                  <SlidersHorizontal className="size-4 text-slate-500" />
                </div>
                <div className="space-y-4">
                  <RangeControl label="Speed" value={speed} min={0.7} max={1.3} step={0.01} onChange={setSpeed} left="Slower" right="Faster" />
                  <RangeControl label="Stability" value={stability} min={0} max={1} step={0.01} onChange={setStability} left="More variable" right="More stable" />
                  <RangeControl label="Similarity Boost" value={similarity} min={0} max={1} step={0.01} onChange={setSimilarity} left="Low" right="High" />
                  <RangeControl label="Style Exaggeration" value={style} min={0} max={1} step={0.01} onChange={setStyle} left="None" right="Exaggerated" />
                </div>
              </ControlCard>
            ) : null}

            {selectedModel.controls === "minimax" ? (
              <ControlCard>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-white">Voice Control</p>
                  <SlidersHorizontal className="size-4 text-slate-500" />
                </div>
                <div className="space-y-4">
                  <RangeControl label="Speed" value={speed} min={0.5} max={2} step={0.01} onChange={setSpeed} left="Slower" right="Faster" />
                  <RangeControl label="Volume" value={volume} min={0} max={10} step={0.01} onChange={setVolume} left="Quieter" right="Louder" />
                  <RangeControl label="Pitch" value={pitch} min={-12} max={12} step={0.01} onChange={setPitch} left="Lower" right="Higher" />
                  <RangeControl label="Tone" value={tone} min={-1} max={1} step={0.01} onChange={setTone} left="Deepen" right="Lighten" />
                  <RangeControl label="Intensity" value={intensity} min={-1} max={1} step={0.01} onChange={setIntensity} left="Softer" right="Stronger" />
                  <RangeControl label="Timbre" value={timbre} min={-1} max={1} step={0.01} onChange={setTimbre} left="Nasal" right="Crisp" />
                </div>
              </ControlCard>
            ) : null}
          </div>

          <div className="border-t border-white/8 p-3.5">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className="flex h-10.5 w-full items-center justify-center gap-2 rounded-xl bg-[#ec22c4] text-[13px] font-bold text-white shadow-[0_18px_48px_rgba(236,34,196,0.22)] transition hover:bg-[#ff33d4] disabled:cursor-not-allowed disabled:bg-[#8b1b78] disabled:text-white/45"
            >
              {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate {selectedModel.credits} credits
            </button>
          </div>
        </section>

        <section className="hidden overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#111315] lg:flex lg:flex-col">
          <div className="flex h-13 items-center justify-between border-b border-white/8 px-3.5">
            <div className="flex items-center gap-2">
              <button className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-bold text-black">
                <RefreshCw className="size-4" />
                All Creations
                <ChevronDown className="size-4" />
              </button>
              <button className="inline-flex h-8.5 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-slate-300 transition hover:bg-white/7 hover:text-white">
                <ListFilter className="size-4" />
                Labels
              </button>
              <button className="inline-flex h-8.5 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-slate-300 transition hover:bg-white/7 hover:text-white">
                <FolderOpen className="size-4" />
                Folders
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex size-8.5 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                <AudioLines className="size-4" />
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                <Star className="size-4" />
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                <Shield className="size-4" />
              </button>
              <button className="flex size-8.5 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                <Search className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-md border border-white/25" />
              <span className="text-[13px] font-semibold text-slate-500">This Month</span>
            </div>

            <div className="grid max-w-4xl grid-cols-3 gap-3 2xl:grid-cols-4">
              {results.map((result) => {
                const voice =
                  voiceOptions.find((item) => item.id === result.voiceId) ??
                  defaultVoiceOptions[0];
                const isPlaying = playingId === result.id;
                const resultModel =
                  audioModels.find((model) => model.id === result.modelId) ?? audioModels[1];

                return (
                  <article
                    key={result.id}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#1a1d20] transition hover:border-primary/35 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
                  >
                    <div className="relative flex aspect-[1.08] flex-col justify-end overflow-hidden bg-[linear-gradient(180deg,rgba(236,34,196,0.24),rgba(16,185,129,0.14)_62%,rgba(14,16,18,1))] p-2.5">
                      <div className="absolute inset-0 opacity-85">
                        <Waveform />
                      </div>
                      <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <IconButton label="More">
                          <MoreVertical className="size-4" />
                        </IconButton>
                        <IconButton label="Download">
                          <Download className="size-4" />
                        </IconButton>
                        <IconButton label="Favorite">
                          <Star className="size-4" />
                        </IconButton>
                      </div>
                      <div className="relative z-10">
                        <p className="line-clamp-2 text-[13px] font-bold leading-4 text-white">
                          {result.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/70">
                          {result.prompt}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex h-7 items-center gap-1 rounded-full bg-black/35 px-2 text-xs font-bold text-white backdrop-blur">
                            <Volume2 className="size-3.5" />
                            {result.status === "processing" ? "Creating..." : result.duration}
                          </span>
                          <button
                            type="button"
                            onClick={() => speak(result.prompt, result.id, voice)}
                            disabled={result.status === "processing"}
                            className="flex size-9 items-center justify-center rounded-xl bg-white text-black transition hover:scale-105"
                            aria-label={isPlaying ? "Stop audio preview" : "Play audio preview"}
                          >
                            {result.status === "processing" ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : isPlaying ? (
                              <RefreshCw className="size-4" />
                            ) : (
                              <Play className="ml-0.5 size-4 fill-current" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5 p-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-bold text-white">{voice.name} voice</p>
                          <p className="mt-1 text-xs text-slate-500">{resultModel.name} · {result.createdAt}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(result.prompt)}
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/7 text-slate-300 transition hover:bg-white/10 hover:text-white"
                          aria-label="Copy prompt"
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Pill icon={Mic2}>Voice-over</Pill>
                        <Pill icon={Clock3}>{result.duration}</Pill>
                        <Pill icon={Gauge}>{speed.toFixed(2)}x</Pill>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pb-[112px] lg:hidden">
          <div className="sticky top-0 z-30 -mx-3 border-b border-white/8 bg-[#07090b]/92 px-3 pb-3 pt-1 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-black leading-tight text-white">Audio Studio</p>
                <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                  Voice-over creation
                </p>
              </div>
              <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 text-xs font-black text-primary">
                <Sparkles className="size-3.5" />
                {selectedModel.credits} credits
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <ControlCard className="p-2.5">
              <button
                type="button"
                onClick={() => setShowModelPicker(true)}
                className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-white/[0.035] px-3 py-2.5 text-left"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-primary">
                    <AudioLines className="size-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Model
                    </span>
                    <span className="block truncate text-sm font-black text-white">
                      {selectedModel.name}
                    </span>
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-slate-500" />
              </button>
            </ControlCard>

            <ControlCard>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-white">Script</p>
                  <p className="mt-0.5 text-xs text-slate-500">Type the words you want spoken.</p>
                </div>
                <span className="rounded-full bg-white/7 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                  {prompt.length}/10k
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1012]">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value.slice(0, 10000))}
                  placeholder="Enter your voice-over script..."
                  className="min-h-[176px] w-full resize-none bg-transparent px-3.5 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                />
                <div className="flex items-center border-t border-white/7 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setPrompt("")}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-white/5 px-3 text-xs font-bold text-slate-400"
                  >
                    <Trash2 className="size-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Quick scripts
                  </p>
                  <button
                    type="button"
                    onClick={shufflePromptPresets}
                    className="flex size-8 items-center justify-center rounded-full bg-white/7 text-slate-300"
                    aria-label="Shuffle script ideas"
                  >
                    <RefreshCw className="size-3.5" />
                  </button>
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {visiblePromptPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPrompt(preset.prompt)}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-bold text-slate-300"
                    >
                      <FileText className="size-3.5" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </ControlCard>

            <ControlCard>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">Voice</p>
                  <p className="mt-0.5 text-xs text-slate-500">Choose a voice and preview it.</p>
                </div>
                <button
                  type="button"
                  onClick={() => previewVoice(selectedVoice)}
                  disabled={previewingVoiceId === selectedVoice.id}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-black text-black disabled:opacity-60"
                >
                  {previewingVoiceId === selectedVoice.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5 fill-current" />
                  )}
                  Preview
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowVoicePicker(true)}
                className="flex min-h-16 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-left"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-black text-white",
                      selectedVoice.accentClass
                    )}
                  >
                    {selectedVoice.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-white">
                      {selectedVoice.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {selectedVoice.accent} / {selectedVoice.gender} / {selectedVoice.usecase}
                    </span>
                  </span>
                </span>
                <ChevronDown className="-rotate-90 size-4 shrink-0 text-slate-500" />
              </button>
            </ControlCard>

            {selectedModel.controls === "eleven" ? (
              <details className="group rounded-2xl border border-white/8 bg-white/[0.035] p-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-white">
                  Voice controls
                  <ChevronDown className="size-4 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <RangeControl label="Speed" value={speed} min={0.7} max={1.3} step={0.01} onChange={setSpeed} left="Slower" right="Faster" />
                  <RangeControl label="Stability" value={stability} min={0} max={1} step={0.01} onChange={setStability} left="Variable" right="Stable" />
                  <RangeControl label="Similarity" value={similarity} min={0} max={1} step={0.01} onChange={setSimilarity} left="Low" right="High" />
                  <RangeControl label="Style" value={style} min={0} max={1} step={0.01} onChange={setStyle} left="None" right="Strong" />
                </div>
              </details>
            ) : null}

            {selectedModel.controls === "minimax" ? (
              <details className="group rounded-2xl border border-white/8 bg-white/[0.035] p-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-white">
                  Voice controls
                  <ChevronDown className="size-4 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <RangeControl label="Speed" value={speed} min={0.5} max={2} step={0.01} onChange={setSpeed} left="Slower" right="Faster" />
                  <RangeControl label="Volume" value={volume} min={0} max={10} step={0.01} onChange={setVolume} left="Quiet" right="Loud" />
                  <RangeControl label="Pitch" value={pitch} min={-12} max={12} step={0.01} onChange={setPitch} left="Lower" right="Higher" />
                  <RangeControl label="Tone" value={tone} min={-1} max={1} step={0.01} onChange={setTone} left="Deep" right="Light" />
                  <RangeControl label="Intensity" value={intensity} min={-1} max={1} step={0.01} onChange={setIntensity} left="Soft" right="Strong" />
                  <RangeControl label="Timbre" value={timbre} min={-1} max={1} step={0.01} onChange={setTimbre} left="Nasal" right="Crisp" />
                </div>
              </details>
            ) : null}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-black text-white">Recent audio</p>
                <span className="text-xs font-semibold text-slate-500">{results.length} creations</span>
              </div>
              <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {results.map((result) => {
                  const voice =
                    voiceOptions.find((item) => item.id === result.voiceId) ??
                    defaultVoiceOptions[0];
                  const resultModel =
                    audioModels.find((model) => model.id === result.modelId) ?? audioModels[1];
                  const isPlaying = playingId === result.id;

                  return (
                    <article
                      key={result.id}
                      className="w-[74vw] max-w-[18rem] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#191c1f]"
                    >
                      <div className="relative flex aspect-[1.2] flex-col justify-end overflow-hidden bg-[linear-gradient(180deg,rgba(236,34,196,0.24),rgba(16,185,129,0.14)_62%,rgba(14,16,18,1))] p-3">
                        <div className="absolute inset-0 opacity-80">
                          <Waveform />
                        </div>
                        <div className="relative z-10">
                          <p className="line-clamp-2 text-sm font-black leading-4 text-white">
                            {result.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/65">
                            {result.prompt}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-black/35 px-2 text-xs font-black text-white">
                              <Volume2 className="size-3.5" />
                              {result.status === "processing" ? "Creating" : result.duration}
                            </span>
                            <button
                              type="button"
                              onClick={() => speak(result.prompt, result.id, voice)}
                              disabled={result.status === "processing"}
                              className="flex size-10 items-center justify-center rounded-full bg-white text-black"
                              aria-label={isPlaying ? "Stop audio preview" : "Play audio preview"}
                            >
                              {result.status === "processing" ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : isPlaying ? (
                                <RefreshCw className="size-4" />
                              ) : (
                                <Play className="ml-0.5 size-4 fill-current" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-black text-white">{voice.name} voice</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{resultModel.name}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="fixed inset-x-3 bottom-[76px] z-40 lg:hidden">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#ec22c4] text-sm font-black text-white shadow-[0_18px_48px_rgba(236,34,196,0.35)] disabled:cursor-not-allowed disabled:bg-[#8b1b78] disabled:text-white/45"
            >
              {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate audio - {selectedModel.credits} credits
            </button>
          </div>
        </section>
      </div>

      {showModelPicker ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md lg:items-center">
          <div className="max-h-[86dvh] w-full overflow-hidden rounded-t-[1.6rem] border border-white/12 bg-[#191b1d] shadow-[0_30px_120px_rgba(0,0,0,0.55)] lg:w-[min(56rem,calc(100vw-5rem))] lg:rounded-[1.4rem]">
            <div className="flex h-14 items-center justify-between border-b border-white/8 px-5">
              <div>
                <p className="text-base font-bold text-white">Audio Model</p>
                <p className="mt-1 text-xs text-slate-500">Replicate voice models connected to Vireon generation.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModelPicker(false)}
                className="flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/8 hover:text-white"
                aria-label="Close model picker"
              >
                <X className="size-4.5" />
              </button>
            </div>
            <div className="max-h-[calc(86dvh-3.5rem)] space-y-2 overflow-y-auto p-3.5 lg:max-h-none lg:p-4">
              {audioModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModelId(model.id);
                    setShowModelPicker(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition",
                    selectedModelId === model.id
                      ? "bg-white/14 text-white"
                      : "bg-black/12 text-slate-300 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      model.provider === "MiniMax"
                        ? "bg-[#ec22c4]/15 text-[#ec22c4]"
                        : "bg-white/8 text-white"
                    )}
                  >
                    <AudioLines className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold">{model.name}</span>
                      {model.badge ? (
                        <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-300">
                          {model.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {model.description}
                    </span>
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {model.credits} credits
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showVoicePicker ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 backdrop-blur-md lg:items-center">
          <div className="max-h-[90dvh] w-full overflow-hidden rounded-t-[1.6rem] border border-white/12 bg-[#191b1d] shadow-[0_30px_120px_rgba(0,0,0,0.55)] lg:w-[min(62rem,calc(100vw-6rem))] lg:rounded-[1.4rem]">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              <div>
                <p className="text-lg font-bold tracking-tight text-white">Voice Selection</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedModel.name} · {voiceOptions.length} voices
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVoicePicker(false)}
                className="flex size-10 items-center justify-center rounded-xl border border-white/30 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close voice selection"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 px-4 pb-4 lg:grid-cols-4 lg:gap-3 lg:px-6">
              <VoiceFilterSelect
                label="Accent"
                value={voiceFilters.accent}
                options={voiceFilterOptions.accent}
                onChange={(value) =>
                  setVoiceFilters((current) => ({ ...current, accent: value }))
                }
              />
              <VoiceFilterSelect
                label="Gender"
                value={voiceFilters.gender}
                options={voiceFilterOptions.gender}
                onChange={(value) =>
                  setVoiceFilters((current) => ({ ...current, gender: value }))
                }
              />
              <VoiceFilterSelect
                label="Age"
                value={voiceFilters.age}
                options={voiceFilterOptions.age}
                onChange={(value) =>
                  setVoiceFilters((current) => ({ ...current, age: value }))
                }
              />
              <VoiceFilterSelect
                label="Usecase"
                value={voiceFilters.usecase}
                options={voiceFilterOptions.usecase}
                onChange={(value) =>
                  setVoiceFilters((current) => ({ ...current, usecase: value }))
                }
              />
            </div>

            <div className="mx-4 mb-4 max-h-[calc(90dvh-12rem)] overflow-y-auto rounded-2xl bg-black/10 p-2.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.22)_transparent] lg:mx-6 lg:mb-6 lg:max-h-[31rem] lg:p-4">
              {isLoadingVoices ? (
                <div className="flex h-56 items-center justify-center text-sm font-semibold text-slate-400">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading voices
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVoiceOptions.map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => {
                        setSelectedVoiceId(voice.id);
                        setShowVoicePicker(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedVoiceId(voice.id);
                          setShowVoicePicker(false);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition lg:gap-4 lg:p-4",
                        selectedVoiceId === voice.id
                          ? "border-[#ec72d8]/45 bg-[#ec22c4]/8 shadow-[0_0_40px_rgba(236,34,196,0.11)]"
                          : "border-white/8 bg-white/[0.025] hover:border-white/16 hover:bg-white/[0.045]"
                      )}
                    >
                      <span className="shrink-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void previewVoice(voice);
                          }}
                          disabled={previewingVoiceId === voice.id}
                          className={cn(
                            "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-base font-black text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition hover:scale-105 disabled:cursor-wait disabled:opacity-70",
                            voice.accentClass
                          )}
                          aria-label={`Preview ${voice.name}`}
                        >
                          {previewingVoiceId === voice.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Play className="ml-0.5 size-4 fill-current" />
                          )}
                        </button>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-white">
                          {voice.name}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {[voice.accent, voice.age, voice.gender, voice.usecase].map((tag) => (
                            <span
                              key={`${voice.id}-${tag}`}
                              className="rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-[11px] font-semibold text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </span>
                        <span className="mt-2 block line-clamp-2 text-xs text-slate-500 lg:truncate">
                          {voice.description}
                        </span>
                      </span>
                      {selectedVoiceId === voice.id ? (
                        <span className="text-[#ec72d8]">✓</span>
                      ) : null}
                    </div>
                  ))}
                  {!filteredVoiceOptions.length ? (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.025] text-sm font-semibold text-slate-500">
                      No voices match these filters.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VoiceFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-white/12 bg-white/8 px-3 text-[13px] font-semibold text-white outline-none transition hover:bg-white/10 focus:border-[#ec72d8]/50"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#191b1d] text-white">
            {option === "All" ? label : option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
    </label>
  );
}

function ControlCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[1rem] border border-white/8 bg-white/[0.035] p-3.5", className)}>
      {children}
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  left,
  right,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  left: string;
  right: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-bold text-white">{label}</span>
        <span className="text-xs tabular-nums text-slate-500">{value.toFixed(2)}</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#101214] px-3 py-2.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1 w-full accent-[#ec72d8]"
        />
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{left}</span>
          <span>{right}</span>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex size-9 items-center justify-center rounded-xl bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function Pill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-white/7 px-2 text-[11px] font-bold text-slate-300">
      <Icon className="size-3" />
      {children}
    </span>
  );
}

function Waveform() {
  return (
    <div className="flex h-full items-center justify-center gap-2 px-8">
      {[34, 52, 78, 112, 138, 112, 76, 50, 32].map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-7 rounded-full bg-white/20 blur-[1px]"
          style={{
            height,
            background:
              index % 3 === 0
                ? "rgba(236,114,216,0.28)"
                : index % 3 === 1
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(16,185,129,0.26)",
          }}
        />
      ))}
    </div>
  );
}
