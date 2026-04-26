export const imageStyles = [
  "Photoreal",
  "Cinematic",
  "Anime",
  "3D Render",
  "Fashion",
  "Fantasy",
  "Minimal",
  "Dark Editorial"
] as const;

export const aspectRatios = [
  { label: "1:1", value: "1:1" },
  { label: "3:4", value: "3:4" },
  { label: "4:3", value: "4:3" },
  { label: "9:16", value: "9:16" },
  { label: "16:9", value: "16:9" }
] as const;

export const recentImageGenerations = [
  {
    id: "img-1",
    title: "Neon Saint Portrait",
    style: "Cinematic",
    ratio: "4:3"
  },
  {
    id: "img-2",
    title: "Luxury Editorial Frame",
    style: "Fashion",
    ratio: "3:4"
  },
  {
    id: "img-3",
    title: "Astral Bloom",
    style: "Fantasy",
    ratio: "1:1"
  },
  {
    id: "img-4",
    title: "Chrome Runner",
    style: "3D Render",
    ratio: "16:9"
  }
];

export const promptSuggestions = [
  "A cinematic portrait of a futuristic African queen in glowing emerald robes, ultra detailed, volumetric lighting",
  "Luxury skincare product display on reflective glass with dramatic shadows and premium studio lighting",
  "Aerial sci-fi megacity at night with neon highways, atmospheric fog, highly detailed concept art",
  "Elegant fashion editorial shot of a model in metallic silver couture, soft rim light, dark backdrop"
];