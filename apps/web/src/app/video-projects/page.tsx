import type { Metadata } from "next";
import { VideoProjectsPageClient } from "@/components/video-projects/video-projects-page-client";

export const metadata: Metadata = {
  title: "Multi-Scene AI Video Projects | Vireon AI",
  description:
    "Create longer AI videos scene by scene using Vireon AI's multi-scene video project workflow."
};

export default function VideoProjectsPage() {
  return <VideoProjectsPageClient />;
}
