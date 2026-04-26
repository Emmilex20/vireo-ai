import { VideoProjectDetailClient } from "@/components/video-projects/video-project-detail-client";

export default async function VideoProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <VideoProjectDetailClient projectId={projectId} />;
}
