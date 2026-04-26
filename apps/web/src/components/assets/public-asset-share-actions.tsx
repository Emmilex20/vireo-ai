"use client";

type PublicAssetShareActionsProps = {
  url: string;
  title: string;
};

export function PublicAssetShareActions({
  url,
  title
}: PublicAssetShareActionsProps) {
  async function copyLink() {
    await navigator.clipboard.writeText(url);
    alert("Link copied");
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
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
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`}
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
        Copy link
      </button>
    </div>
  );
}
