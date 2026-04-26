import {
  AudioLines,
  Clapperboard,
  ImageIcon,
  Sparkles,
  Wand2
} from "lucide-react";

export const heroSlides = [
  {
    id: "hero-1",
    eyebrow: "New release",
    title: "Turn prompts into cinematic AI visuals.",
    description:
      "Generate stunning images, motion, and video with premium creative controls built for modern creators.",
    ctaPrimary: "Start creating",
    ctaSecondary: "Explore feed"
  },
  {
    id: "hero-2",
    eyebrow: "Creator tools",
    title: "Build image, video, motion, and sound from one platform.",
    description:
      "Move from concept to polished content inside a unified AI creation workflow designed to scale.",
    ctaPrimary: "Try Vireon",
    ctaSecondary: "See features"
  }
];

export const quickTools = [
  {
    id: "tool-image",
    title: "AI Image",
    description: "Generate rich still visuals from prompts and style presets.",
    icon: ImageIcon
  },
  {
    id: "tool-video",
    title: "AI Video",
    description: "Create short cinematic clips with prompt-based generation.",
    icon: Clapperboard
  },
  {
    id: "tool-restyle",
    title: "Restyle",
    description: "Transform existing media into new visual directions.",
    icon: Wand2
  },
  {
    id: "tool-motion",
    title: "Motion Lab",
    description: "Add movement controls for animated creative outputs.",
    icon: Sparkles
  },
  {
    id: "tool-sound",
    title: "AI Sound",
    description: "Generate sound concepts and creative audio layers.",
    icon: AudioLines
  }
];

export const topTabs = ["Recommended", "Following", "Events"] as const;

export const categoryPills = [
  "For You",
  "Trending",
  "AI Image",
  "AI Video",
  "Motion",
  "Restyle",
  "Sound"
] as const;

export const exploreCards = [
  {
    id: "card-1",
    title: "Neon City Oracle",
    creator: "PixelMara",
    likes: 12400,
    views: "1.2M",
    height: "tall"
  },
  {
    id: "card-2",
    title: "Glass Fashion Portrait",
    creator: "Ari Zen",
    likes: 8300,
    views: "892K",
    height: "medium"
  },
  {
    id: "card-3",
    title: "Cinematic Desert Run",
    creator: "Vanta Studio",
    likes: 19500,
    views: "2.3M",
    height: "wide"
  },
  {
    id: "card-4",
    title: "Dreamcore Bloom",
    creator: "Ivy Motion",
    likes: 6400,
    views: "433K",
    height: "medium"
  },
  {
    id: "card-5",
    title: "Future Monk Sequence",
    creator: "Nox Atelier",
    likes: 15300,
    views: "1.8M",
    height: "tall"
  },
  {
    id: "card-6",
    title: "Golden Hour Echo",
    creator: "Frame District",
    likes: 9200,
    views: "976K",
    height: "medium"
  },
  {
    id: "card-7",
    title: "Velocity Street Frame",
    creator: "Luna Path",
    likes: 7100,
    views: "511K",
    height: "wide"
  },
  {
    id: "card-8",
    title: "Oceanic Signal",
    creator: "Voidcraft",
    likes: 11000,
    views: "1.1M",
    height: "tall"
  }
];