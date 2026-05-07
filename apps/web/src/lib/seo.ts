export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_APP_URL || "https://getvireonai.com"
);

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function normalizeSiteUrl(value: string) {
  try {
    const url = new URL(value);
    url.protocol = "https:";
    url.hostname = url.hostname.replace(/^www\./, "");
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "https://getvireonai.com";
  }
}

export function cleanSeoText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function seoDescription(
  value: string | null | undefined,
  fallback: string,
  maxLength = 156
) {
  const text = cleanSeoText(value) || fallback;

  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength - 1).replace(/\s+\S*$/, "");
  return `${sliced}.`;
}
