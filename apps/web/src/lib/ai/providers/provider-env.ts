export const PROVIDER_ENV_CHECKS = [
  {
    key: "replicate",
    name: "Replicate",
    required: ["REPLICATE_API_TOKEN"],
  },
  {
    key: "replicate-video",
    name: "Replicate Video",
    required: ["REPLICATE_API_TOKEN", "REPLICATE_VIDEO_MODEL"],
  },
  {
    key: "fal",
    name: "Fal AI",
    required: ["FAL_KEY"],
  },
  {
    key: "runway",
    name: "Runway",
    required: ["RUNWAY_API_KEY"],
  },
];

export function getProviderEnvStatus() {
  return PROVIDER_ENV_CHECKS.map((provider) => {
    const missing = provider.required.filter((key) => !process.env[key]);

    return {
      ...provider,
      ready: missing.length === 0,
      missing,
    };
  });
}
