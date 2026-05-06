import type { AudioGenerationInput } from "./types";

export type ReplicateAudioModelId =
  | "elevenlabs/v3"
  | "elevenlabs/v2-multilingual"
  | "minimax/speech-2.8-hd"
  | "minimax/speech-2.8-turbo";

export type ReplicateAudioModel = {
  id: ReplicateAudioModelId;
  label: string;
  description: string;
  provider: "ElevenLabs" | "MiniMax";
  tier: "standard" | "premium";
  defaultVoiceId: string;
  defaultCredits: number;
  buildInput(input: AudioGenerationInput): Record<string, unknown>;
};

const ELEVEN_DEFAULT_VOICE_ID = "Rachel";
const MINIMAX_DEFAULT_VOICE_ID = "English_Wiselady";

export const replicateAudioModels: ReplicateAudioModel[] = [
  {
    id: "elevenlabs/v3",
    label: "Eleven v3",
    description: "Natural speech with high emotional range.",
    provider: "ElevenLabs",
    tier: "premium",
    defaultVoiceId: ELEVEN_DEFAULT_VOICE_ID,
    defaultCredits: 15,
    buildInput(input) {
      return {
        prompt: input.prompt,
        voice: input.voiceId ?? input.voice ?? ELEVEN_DEFAULT_VOICE_ID,
        stability: input.stability,
        similarity_boost: input.similarityBoost,
        style: input.style,
        speed: input.speed,
        language_code: input.languageCode,
      };
    },
  },
  {
    id: "elevenlabs/v2-multilingual",
    label: "Eleven Multilingual v2",
    description: "High-quality multilingual voice-over generation.",
    provider: "ElevenLabs",
    tier: "standard",
    defaultVoiceId: ELEVEN_DEFAULT_VOICE_ID,
    defaultCredits: 15,
    buildInput(input) {
      return {
        prompt: input.prompt,
        voice: input.voiceId ?? input.voice ?? ELEVEN_DEFAULT_VOICE_ID,
        stability: input.stability,
        similarity_boost: input.similarityBoost,
        style: input.style,
        speed: input.speed,
        language_code: input.languageCode,
      };
    },
  },
  {
    id: "minimax/speech-2.8-hd",
    label: "MiniMax Speech 2.8 HD",
    description: "High-definition text-to-speech with fine-grained voice control.",
    provider: "MiniMax",
    tier: "premium",
    defaultVoiceId: MINIMAX_DEFAULT_VOICE_ID,
    defaultCredits: 15,
    buildInput(input) {
      return {
        text: input.prompt,
        voice_id: input.voiceId ?? input.voice ?? MINIMAX_DEFAULT_VOICE_ID,
        speed: input.speed,
        volume: input.volume ?? 1,
        pitch: input.pitch,
        emotion: input.emotion,
        sample_rate: input.sampleRate ?? 32000,
        audio_format: input.format ?? "mp3",
      };
    },
  },
  {
    id: "minimax/speech-2.8-turbo",
    label: "MiniMax Speech 2.8 Turbo",
    description: "Fast, cost-effective text-to-speech with useful voice control.",
    provider: "MiniMax",
    tier: "standard",
    defaultVoiceId: MINIMAX_DEFAULT_VOICE_ID,
    defaultCredits: 10,
    buildInput(input) {
      return {
        text: input.prompt,
        voice_id: input.voiceId ?? input.voice ?? MINIMAX_DEFAULT_VOICE_ID,
        speed: input.speed,
        volume: input.volume ?? 1,
        pitch: input.pitch,
        emotion: input.emotion,
        sample_rate: input.sampleRate ?? 32000,
        audio_format: input.format ?? "mp3",
      };
    },
  },
];

export function isReplicateAudioModelId(
  value?: string | null
): value is ReplicateAudioModelId {
  return replicateAudioModels.some((model) => model.id === value);
}

export function resolveReplicateAudioModel(
  value?: string | null
): ReplicateAudioModel {
  return (
    replicateAudioModels.find((model) => model.id === value) ??
    replicateAudioModels[1]
  );
}
