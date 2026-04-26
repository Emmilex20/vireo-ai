"use client";

type Scene = {
  id: string;
  order: number;
  title?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  status: string;
};

export function StoryboardTimeline({ scenes }: { scenes: Scene[] }) {
  if (scenes.length === 0) return null;

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-black/30 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Storyboard preview</h3>
        <span className="text-xs text-muted-foreground">
          {scenes.length} scenes
        </span>
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {scenes.map((scene, index) => (
          <div key={scene.id} className="flex items-center gap-4">
            <div className="w-48 shrink-0">
              <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/40">
                {scene.videoUrl ? (
                  <video
                    src={scene.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-28 w-full object-cover"
                  />
                ) : scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.title || "Scene image"}
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">
                    No media
                  </div>
                )}
              </div>

              <div className="mt-2">
                <p className="text-xs font-medium text-white">
                  Scene {scene.order}
                </p>
                <p className="line-clamp-2 text-[11px] text-muted-foreground">
                  {scene.title || "Untitled scene"}
                </p>
              </div>
            </div>

            {index !== scenes.length - 1 ? (
              <div className="flex h-28 items-center">
                <div className="h-[2px] w-10 bg-white/20" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
