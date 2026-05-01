"use client";

import { useEffect, useState } from "react";
import { ImageStudioComposer } from "./image-studio-composer";
import { StudioToolbar } from "./studio-toolbar";
import { VideoStudioComposer } from "./video-studio-composer";
import { StudioShell } from "./studio-shell";
import type { StudioMode } from "./studio-mode-config";

type ClientStudioLayoutProps = {
  initialMode?: StudioMode;
  initialVideoModelSlug?: string;
};

export function ClientStudioLayout({
  initialMode = "image",
  initialVideoModelSlug,
}: ClientStudioLayoutProps = {}) {
  const [mode, setMode] = useState<StudioMode>(() => {
    if (typeof window === "undefined" || initialMode === "video") {
      return initialMode;
    }

    const requestedMode = window.sessionStorage.getItem(
      "vireon_studio_open_mode"
    );

    if (requestedMode === "image" || requestedMode === "video") {
      return requestedMode;
    }

    return initialMode;
  });

  useEffect(() => {
    sessionStorage.removeItem("vireon_studio_open_mode");
  }, []);

  useEffect(() => {
    function handleModeChange(event: Event) {
      const mode = (event as CustomEvent<StudioMode>).detail;

      if (mode === "image" || mode === "video") {
        setMode(mode);
      }
    }

    window.addEventListener("vireon:studio-mode", handleModeChange);

    return () => {
      window.removeEventListener("vireon:studio-mode", handleModeChange);
    };
  }, []);

  return (
    <StudioShell
      toolbar={<StudioToolbar mode={mode} onChangeMode={setMode} />}
    >
      {mode === "image" ? (
        <ImageStudioComposer onChangeMode={setMode} />
      ) : (
        <VideoStudioComposer
          onChangeMode={setMode}
          initialModelSlug={initialVideoModelSlug}
        />
      )}
    </StudioShell>
  );
}
