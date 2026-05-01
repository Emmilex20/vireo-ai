export const videoDurations = [
  { label: "5s", value: "5" },
  { label: "10s", value: "10" },
  { label: "15s", value: "15" },
  { label: "20s", value: "20" },
] as const;

export const videoAspectRatios = [
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "1:1", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "3:4", value: "3:4" },
  { label: "21:9", value: "21:9" },
] as const;

export const motionIntensityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
] as const;

export const cameraMoves = [
  "Static",
  "Slow Push In",
  "Pull Back",
  "Pan Left",
  "Pan Right",
  "Orbit",
  "Tilt Up",
  "Tilt Down",
] as const;

export const videoShotTypes = [
  "Wide Shot",
  "Medium Shot",
  "Close Up",
  "Overhead",
  "Tracking Shot",
  "Establishing Shot",
] as const;

export const videoFpsOptions = [
  { label: "24 fps", value: "24" },
  { label: "30 fps", value: "30" },
  { label: "60 fps", value: "60" },
] as const;

export const videoResolutionOptions = [
  { label: "480p", value: "480p" },
  { label: "720p", value: "720p" },
  { label: "1080p", value: "1080p" },
  { label: "4K", value: "4K" },
] as const;

export const styleStrengthOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
] as const;

export const videoPromptSuggestions = [
  "A cinematic drone shot over a futuristic African megacity at sunrise, soft haze, reflective towers, high realism",
  "Luxury skincare product rotating slowly on a glass pedestal, dramatic shadows, premium studio lighting, ad-style motion",
  "A fashion model walking through a dark editorial set with soft spotlight, slow-motion elegance, high-end campaign look",
  "A sci-fi warrior standing on a cliff as the camera slowly pushes in, atmospheric fog, epic cinematic mood",
];
