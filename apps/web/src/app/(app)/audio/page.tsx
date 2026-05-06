import { AudioPageClient } from "@/components/audio/audio-page-client";
import { auth } from "@clerk/nextjs/server";
import { getUserGenerationHistory } from "@vireon/db";

type AudioSettings = {
  voicePresetId?: string | null;
};

function titleFromPrompt(prompt?: string | null) {
  const words = prompt?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words.slice(0, 5).join(" ") || "Untitled voice-over";
}

function durationFromPrompt(prompt?: string | null) {
  const words = prompt?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const seconds = Math.max(8, Math.ceil(words / 2.4));
  return `0:${String(Math.min(59, seconds)).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  const now = new Date();
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  ) {
    return "This Month";
  }

  return date.toLocaleString("en", { month: "long" });
}

export default async function AudioPage() {
  const { userId } = await auth();
  const history = userId ? await getUserGenerationHistory(userId) : [];
  const audioResults = history
    .filter((job) => job.type === "audio")
    .map((job) => {
      const settings = job.settings as AudioSettings | null;

      return {
        id: job.id,
        title: titleFromPrompt(job.prompt),
        prompt: job.prompt ?? "",
        voiceId: settings?.voicePresetId ?? job.style ?? "veer",
        modelId: job.modelId ?? "elevenlabs/v2-multilingual",
        duration: durationFromPrompt(job.prompt),
        createdAt: monthLabel(job.createdAt),
        outputUrl: job.outputUrl,
        status: job.status as "processing" | "completed" | "failed",
        settings: job.settings,
      };
    });

  return <AudioPageClient initialResults={audioResults} />;
}
