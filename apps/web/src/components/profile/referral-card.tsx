"use client";

import { useEffect, useMemo, useState } from "react";

export function ReferralCard() {
  const [code, setCode] = useState("");

  useEffect(() => {
    void fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setCode(data.referralCode ?? ""));
  }, []);

  const url = useMemo(() => {
    if (!code || typeof window === "undefined") return "";
    return `${window.location.origin}/ref/${code}`;
  }, [code]);

  return (
    <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-5">
      <p className="text-sm font-semibold text-white">
        Invite friends & earn credits
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        Share your link. When someone joins and creates their first asset, you
        earn credits.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          readOnly
          className="w-full rounded-full bg-black/30 px-4 py-2 text-xs text-white"
        />

        <button
          type="button"
          onClick={() => {
            if (!url) return
            void navigator.clipboard.writeText(url)
          }}
          className="rounded-full bg-white/10 px-4 py-2 text-xs text-white"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
