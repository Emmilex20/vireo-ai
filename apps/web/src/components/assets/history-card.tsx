"use client";

type HistoryCardProps = {
  id: string;
  mediaType?: "image" | "video";
  prompt?: string | null;
  negativePrompt?: string | null;
  failureReason?: string | null;
  refundedAt?: string | null;
  status: string;
  creditsUsed: number;
  createdAt: string;

  style?: string | null;
  aspectRatio?: string | null;
  qualityMode?: string | null;
  promptBoost?: boolean;
  seed?: number | null;
  steps?: number | null;
  guidance?: number | null;

  motionIntensity?: string | null;
  cameraMove?: string | null;
  styleStrength?: string | null;
  motionGuidance?: number | null;
  shotType?: string | null;
  fps?: number | null;
  duration?: number | null;
  sourceImageUrl?: string | null;
  sourceAssetId?: string | null;

  onReuseImage?: (item: {
    id: string;
    prompt?: string | null;
    negativePrompt?: string | null;
    style?: string | null;
    aspectRatio?: string | null;
    qualityMode?: string | null;
    promptBoost?: boolean;
    seed?: number | null;
    steps?: number | null;
    guidance?: number | null;
  }) => void;

  onReuseVideo?: (item: {
    id: string;
    prompt?: string | null;
    negativePrompt?: string | null;
    duration?: number | null;
    aspectRatio?: string | null;
    motionIntensity?: string | null;
    cameraMove?: string | null;
    styleStrength?: string | null;
    motionGuidance?: number | null;
    shotType?: string | null;
    fps?: number | null;
    sourceImageUrl?: string | null;
    sourceAssetId?: string | null;
  }) => void;
};

export function HistoryCard({
  id,
  mediaType = "image",
  prompt,
  negativePrompt,
  failureReason,
  refundedAt,
  status,
  creditsUsed,
  createdAt,
  style,
  aspectRatio,
  qualityMode,
  promptBoost,
  seed,
  steps,
  guidance,
  motionIntensity,
  cameraMove,
  styleStrength,
  motionGuidance,
  shotType,
  fps,
  duration,
  sourceImageUrl,
  sourceAssetId,
  onReuseImage,
  onReuseVideo,
}: HistoryCardProps) {
  const statusClasses =
    status === "completed"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : status === "failed"
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-white">
            {mediaType === "video" ? "Video generation" : "Image generation"}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {prompt || "No prompt stored"}
          </p>
          {negativePrompt ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
              Avoid: {negativePrompt}
            </p>
          ) : null}
          {status === "failed" && failureReason ? (
            <div className="mt-3 rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
              {failureReason}
            </div>
          ) : null}
          {status === "failed" && refundedAt ? (
            <div className="mt-3 rounded-[1rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-300">
              Credits refunded for this failed generation.
            </div>
          ) : null}
        </div>

        <div className={`rounded-full border px-3 py-1 text-xs ${statusClasses}`}>
          {status}
        </div>
      </div>

      {mediaType === "video" && sourceImageUrl ? (
        <div className="mt-3 overflow-hidden rounded-[1rem] border border-white/10 bg-black/30">
          <img
            src={sourceImageUrl}
            alt="Source image"
            className="h-32 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
          {creditsUsed} credits
        </span>

        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
          {new Date(createdAt).toLocaleDateString()}
        </span>

        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
          {mediaType === "video" ? "Video" : "Image"}
        </span>

        {mediaType === "video" && sourceImageUrl ? (
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
            Image-to-video
          </span>
        ) : null}

        {mediaType === "video" && sourceAssetId ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-muted-foreground">
            Source asset linked
          </span>
        ) : null}

        {aspectRatio ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
            {aspectRatio}
          </span>
        ) : null}

        {mediaType === "image" ? (
          <>
            {style ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                {style}
              </span>
            ) : null}
            {qualityMode ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                {qualityMode}
              </span>
            ) : null}
            {steps ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                Steps {steps}
              </span>
            ) : null}
            {guidance ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                Guidance {guidance}
              </span>
            ) : null}
            {seed ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                Seed {seed}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              Boost {promptBoost ? "On" : "Off"}
            </span>
          </>
        ) : (
          <>
            {duration ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                {duration}s
              </span>
            ) : null}
            {motionIntensity ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                Motion {motionIntensity}
              </span>
            ) : null}
            {cameraMove ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                {cameraMove}
              </span>
            ) : null}
            {styleStrength ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                Style {styleStrength}
              </span>
            ) : null}
            {motionGuidance ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                Motion guide {motionGuidance}
              </span>
            ) : null}
            {shotType ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                {shotType}
              </span>
            ) : null}
            {fps ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                {fps} fps
              </span>
            ) : null}
          </>
        )}
      </div>

      {(status === "completed" || status === "failed") &&
      mediaType === "image" &&
      onReuseImage ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              onReuseImage({
                id,
                prompt,
                negativePrompt,
                style,
                aspectRatio,
                qualityMode,
                promptBoost,
                seed,
                steps,
                guidance,
              })
            }
            className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"
          >
            {status === "failed" ? "Retry in Studio" : "Reuse in Studio"}
          </button>
        </div>
      ) : null}

      {(status === "completed" || status === "failed") &&
      mediaType === "video" &&
      onReuseVideo ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              onReuseVideo({
                id,
                prompt,
                negativePrompt,
                duration,
                aspectRatio,
                motionIntensity,
                cameraMove,
                styleStrength,
                motionGuidance,
                shotType,
                fps,
                sourceImageUrl,
                sourceAssetId,
              })
            }
            className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"
          >
            {status === "failed"
              ? "Retry in Video Studio"
              : "Reuse in Video Studio"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
