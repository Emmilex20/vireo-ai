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
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white transition hover:bg-white/10 sm:h-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
    >
      <Coins className="size-3.5 text-primary sm:size-4" />
      {credits === null ? "Credits..." : `${credits} credits`}
    </a>
  );
}
