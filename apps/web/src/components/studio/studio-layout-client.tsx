"use client";

import { useEffect, useState } from "react";
import { ImageStudioComposer } from "./image-studio-composer";
import { StudioToolbar } from "./studio-toolbar";
import { VideoStudioComposer } from "./video-studio-composer";
import { StudioShell } from "./studio-shell";
import type { StudioMode } from "./studio-mode-config";

export function ClientStudioLayout() {
  const [mode, setMode] = useState<StudioMode>("image");

  useEffect(() => {
    const requestedMode = sessionStorage.getItem("vireon_studio_open_mode");
    if (requestedMode === "video") {
      setMode("video");
    }
    sessionStorage.removeItem("vireon_studio_open_mode");
  }, []);

  return (
    <StudioShell
      toolbar={<StudioToolbar mode={mode} onChangeMode={setMode} />}
    >
      {mode === "image" ? <ImageStudioComposer /> : <VideoStudioComposer />}
    </StudioShell>
  );
}
