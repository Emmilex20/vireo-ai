type MediaTypeInput = {
  mediaType?: string | null;
  type?: string | null;
  mimeType?: string | null;
  fileUrl?: string | null;
  generationJob?: {
    type?: string | null;
  } | null;
};

export type InferredMediaType = "image" | "video" | "audio";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"];
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".opus"];

export function inferMediaType(input: MediaTypeInput): InferredMediaType {
  const normalizedMimeType = input.mimeType?.toLowerCase();
  if (normalizedMimeType?.startsWith("audio/")) return "audio";
  if (normalizedMimeType?.startsWith("video/")) return "video";
  if (normalizedMimeType?.startsWith("image/")) return "image";

  const normalizedUrl = input.fileUrl?.toLowerCase() ?? "";
  if (AUDIO_EXTENSIONS.some((extension) => normalizedUrl.endsWith(extension))) {
    return "audio";
  }

  if (VIDEO_EXTENSIONS.some((extension) => normalizedUrl.endsWith(extension))) {
    return "video";
  }

  const normalizedJobType = input.generationJob?.type?.toLowerCase();
  if (normalizedJobType === "audio") return "audio";
  if (normalizedJobType === "video") return "video";
  if (normalizedJobType === "image") return "image";

  const normalizedType = input.type?.toLowerCase();
  if (normalizedType === "audio") return "audio";
  if (normalizedType === "video") return "video";
  if (normalizedType === "image") return "image";

  const normalizedMediaType = input.mediaType?.toLowerCase();
  if (normalizedMediaType === "audio") return "audio";
  if (normalizedMediaType === "video") return "video";
  if (normalizedMediaType === "image") return "image";

  return "image";
}
