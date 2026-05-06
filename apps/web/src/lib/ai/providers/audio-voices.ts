import type { ReplicateAudioModelId } from "./replicate-audio-models";

export type AudioVoiceOption = {
  id: string;
  name: string;
  accent: string;
  gender: "Male" | "Female" | "Neutral";
  age: "Child" | "Teen" | "Young Adult" | "Adult" | "Middle Aged" | "Senior";
  usecase: string;
  description: string;
  accentClass: string;
};

const ELEVEN_VOICE_NAMES = [
  "Rachel",
  "Drew",
  "Clyde",
  "Paul",
  "Aria",
  "Domi",
  "Dave",
  "Roger",
  "Fin",
  "Sarah",
  "James",
  "Jane",
  "Juniper",
  "Arabella",
  "Hope",
  "Bradford",
  "Reginald",
  "Gaming",
  "Austin",
  "Kuon",
  "Blondie",
  "Priyanka",
  "Alexandra",
  "Monika",
  "Mark",
  "Grimblewood",
] as const;

const ELEVEN_FEMALE_VOICES = new Set([
  "Rachel",
  "Aria",
  "Domi",
  "Sarah",
  "Jane",
  "Juniper",
  "Arabella",
  "Hope",
  "Blondie",
  "Priyanka",
  "Alexandra",
  "Monika",
]);

const MINIMAX_FALLBACK_VOICES: AudioVoiceOption[] = [
  {
    id: "English_expressive_narrator",
    name: "Expressive Narrator",
    accent: "English",
    gender: "Male",
    age: "Adult",
    usecase: "Audiobook",
    description:
      "An expressive adult male voice with an English accent, suited for audiobook narration.",
    accentClass: "from-fuchsia-200 to-violet-400",
  },
  {
    id: "English_radiant_girl",
    name: "Radiant Girl",
    accent: "English",
    gender: "Female",
    age: "Young Adult",
    usecase: "Advertisement",
    description:
      "A bright young adult female voice with lively energy for ads and social clips.",
    accentClass: "from-amber-200 to-pink-400",
  },
  {
    id: "English_magnetic_voiced_man",
    name: "Magnetic-voiced Male",
    accent: "English",
    gender: "Male",
    age: "Adult",
    usecase: "Advertisement",
    description:
      "A persuasive adult male voice for commercial reads and confident promos.",
    accentClass: "from-sky-200 to-cyan-400",
  },
  {
    id: "English_compelling_lady1",
    name: "Compelling Lady",
    accent: "English",
    gender: "Female",
    age: "Adult",
    usecase: "Broadcasting",
    description:
      "A clear adult female voice for formal announcements, narration, and broadcast reads.",
    accentClass: "from-indigo-200 to-purple-500",
  },
  {
    id: "English_Trustworth_Man",
    name: "Trustworthy Man",
    accent: "English",
    gender: "Male",
    age: "Adult",
    usecase: "Narration",
    description:
      "A steady adult male voice with a reliable tone for explainers and narration.",
    accentClass: "from-emerald-200 to-teal-400",
  },
  {
    id: "English_Wiselady",
    name: "Wise Lady",
    accent: "English",
    gender: "Female",
    age: "Middle Aged",
    usecase: "Narration",
    description:
      "A composed female voice with a wise, grounded tone for premium narration.",
    accentClass: "from-fuchsia-200 to-violet-400",
  },
  {
    id: "English_Deep-VoicedGentleman",
    name: "Deep-Voiced Gentleman",
    accent: "English",
    gender: "Male",
    age: "Middle Aged",
    usecase: "Storytelling",
    description:
      "A deep male voice for cinematic storytelling, trailers, and dramatic reads.",
    accentClass: "from-sky-200 to-cyan-400",
  },
];

let minimaxVoiceCache:
  | {
      fetchedAt: number;
      voices: AudioVoiceOption[];
    }
  | undefined;

function inferGender(value: string): AudioVoiceOption["gender"] {
  const text = value.toLowerCase();

  if (
    text.includes("female") ||
    text.includes("girl") ||
    text.includes("woman") ||
    text.includes("lady")
  ) {
    return "Female";
  }

  if (
    text.includes("male") ||
    text.includes("man") ||
    text.includes("boy") ||
    text.includes("gentleman") ||
    text.includes("bloke")
  ) {
    return "Male";
  }

  return "Neutral";
}

function inferAge(value: string): AudioVoiceOption["age"] {
  const text = value.toLowerCase();

  if (text.includes("child") || text.includes("kid")) return "Child";
  if (text.includes("teen")) return "Teen";
  if (text.includes("young")) return "Young Adult";
  if (text.includes("mature") || text.includes("middle")) return "Middle Aged";
  if (text.includes("senior") || text.includes("old")) return "Senior";

  return "Adult";
}

function inferUsecase(value: string): string {
  const text = value.toLowerCase();

  if (text.includes("gaming")) return "Gaming";
  if (text.includes("audiobook") || text.includes("narrator")) return "Audiobook";
  if (text.includes("broadcast") || text.includes("news")) return "Broadcasting";
  if (text.includes("story") || text.includes("drama")) return "Storytelling";
  if (text.includes("ad") || text.includes("promo") || text.includes("magnetic")) {
    return "Advertisement";
  }

  return "Narration";
}

function voiceAccentClass(index: number) {
  const accents = [
    "from-fuchsia-200 to-violet-400",
    "from-sky-200 to-cyan-400",
    "from-emerald-200 to-teal-400",
    "from-amber-200 to-pink-400",
    "from-indigo-200 to-purple-500",
  ];

  return accents[index % accents.length];
}

export function getElevenVoices(): AudioVoiceOption[] {
  return ELEVEN_VOICE_NAMES.map((name, index) => {
    const gender = ELEVEN_FEMALE_VOICES.has(name) ? "Female" : "Male";
    const usecase =
      name === "Gaming"
        ? "Gaming"
        : name === "Grimblewood"
          ? "Storytelling"
          : "Narration";

    return {
      id: name,
      name,
      accent: "English",
      gender,
      age: "Adult",
      usecase,
      description: `${name} is an ElevenLabs ${gender.toLowerCase()} voice for polished ${usecase.toLowerCase()} reads.`,
      accentClass: voiceAccentClass(index),
    };
  });
}

export async function getMiniMaxSystemVoices(): Promise<AudioVoiceOption[]> {
  const cacheMs = 1000 * 60 * 60 * 24;

  if (minimaxVoiceCache && Date.now() - minimaxVoiceCache.fetchedAt < cacheMs) {
    return minimaxVoiceCache.voices;
  }

  try {
    const response = await fetch(
      "https://platform.minimax.io/docs/faq/system-voice-id?key=68b40964a96516e26018eee2",
      { next: { revalidate: 60 * 60 * 24 } }
    );

    if (!response.ok) {
      throw new Error(`MiniMax voice list failed with ${response.status}`);
    }

    const html = await response.text();
    const rows = [
      ...html.matchAll(
        /<tr><td style="text-align:left">\d+<\/td><td style="text-align:left">([^<]+)<\/td><td style="text-align:left">([^<]+)<\/td><td style="text-align:left">([^<]+)<\/td><\/tr>/g
      ),
    ];
    const voices = rows.map((row, index) => {
      const language = row[1];
      const id = row[2];
      const name = row[3];
      const gender = inferGender(`${id} ${name}`);
      const age = inferAge(`${id} ${name}`);
      const usecase = inferUsecase(`${id} ${name}`);

      return {
        id,
        name,
        accent: language,
        gender,
        age,
        usecase,
        description: `${name} is a ${language} MiniMax system voice for ${usecase.toLowerCase()} work.`,
        accentClass: voiceAccentClass(index),
      } satisfies AudioVoiceOption;
    });

    if (voices.length) {
      minimaxVoiceCache = {
        fetchedAt: Date.now(),
        voices: voices.map((voice) => ({
          ...voice,
        })),
      };

      return minimaxVoiceCache.voices;
    }
  } catch (error) {
    console.warn("[audio-voices] Failed to load MiniMax system voices", error);
  }

  return MINIMAX_FALLBACK_VOICES;
}

export async function getAudioVoicesForModel(
  modelId: ReplicateAudioModelId
): Promise<AudioVoiceOption[]> {
  if (modelId.startsWith("minimax/")) {
    return getMiniMaxSystemVoices();
  }

  return getElevenVoices();
}

export async function isValidAudioVoiceForModel(
  modelId: ReplicateAudioModelId,
  voiceId: string
) {
  const voices = await getAudioVoicesForModel(modelId);
  return voices.some((voice) => voice.id === voiceId);
}
