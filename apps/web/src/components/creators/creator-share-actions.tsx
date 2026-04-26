"use client";

type CreatorShareActionsProps = {
  url: string;
  username: string;
  displayName?: string | null;
};

export function CreatorShareActions({
  url,
  username,
  displayName
}: CreatorShareActionsProps) {
  const title = `Check out ${displayName || `@${username}`} on Vireon AI`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    alert("Profile link copied");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
      >
        Share on X
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
      >
        Share on Facebook
      </a>

      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"
      >
        Copy profile link
      </button>
    </div>
  );
}
