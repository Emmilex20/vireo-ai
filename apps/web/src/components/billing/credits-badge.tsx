"use client";

import { Coins } from "lucide-react";
import { useEffect, useState } from "react";

export function CreditsBadge() {
  const [credits, setCredits] = useState<number | null>(null);

  async function loadCredits() {
    try {
      const res = await fetch("/api/credits/balance");
      const data = await res.json();
      setCredits(data.credits ?? 0);
    } catch {
      setCredits(0);
    }
  }

  useEffect(() => {
    void loadCredits();

    window.addEventListener("vireon:credits-updated", loadCredits);

    return () => {
      window.removeEventListener("vireon:credits-updated", loadCredits);
    };
  }, []);

  return (
    <a
      href="/billing/credits"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
    >
      <Coins className="size-4 text-primary" />
      {credits === null ? "Credits..." : `${credits} credits`}
    </a>
  );
}
