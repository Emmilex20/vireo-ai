type MediaTypeInput = {
  mediaType?: string | null;
  type?: string | null;
  mimeType?: string | null;
  fileUrl?: string | null;
  generationJob?: {
    type?: string | null;
  } | null;
};

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];

export function inferMediaType(input: MediaTypeInput): "image" | "video" {
  const normalizedType = input.type?.toLowerCase();
  if (normalizedType === "video") return "video";
  if (normalizedType === "image") return "image";

  const normalizedJobType = input.generationJob?.type?.toLowerCase();
  if (normalizedJobType === "video") return "video";
  if (normalizedJobType === "image") return "image";

  const normalizedMimeType = input.mimeType?.toLowerCase();
  if (normalizedMimeType?.startsWith("video/")) return "video";
  if (normalizedMimeType?.startsWith("image/")) return "image";

  const normalizedUrl = input.fileUrl?.toLowerCase() ?? "";
  if (VIDEO_EXTENSIONS.some((extension) => normalizedUrl.endsWith(extension))) {
    return "video";
  }

  const normalizedMediaType = input.mediaType?.toLowerCase();
  if (normalizedMediaType === "video") return "video";
  if (normalizedMediaType === "image") return "image";

  return "image";
}
