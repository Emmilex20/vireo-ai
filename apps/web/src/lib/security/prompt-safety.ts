const BLOCKED_TERMS = [
  "child sexual",
  "csam",
  "minor nude",
  "rape",
  "non-consensual",
  "terrorist propaganda",
  "how to make a bomb",
  "credit card dump"
];

export function checkPromptSafety(prompt: string, negativePrompt?: string) {
  const combined = `${prompt} ${negativePrompt ?? ""}`.toLowerCase();

  const matchedTerm = BLOCKED_TERMS.find((term) =>
    combined.includes(term.toLowerCase())
  );

  if (matchedTerm) {
    return {
      allowed: false,
      reason: "This prompt violates our safety rules.",
      matchedTerm
    };
  }

  return {
    allowed: true,
    reason: null,
    matchedTerm: null
  };
}
