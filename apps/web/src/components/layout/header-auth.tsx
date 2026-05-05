"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { VireonUserButton } from "@/components/layout/vireon-user-button";

export function HeaderAuth() {
  const { isLoaded, userId } = useAuth();
  const [creditsSnapshot, setCreditsSnapshot] = useState<{
    userId: string;
    balance: number;
  } | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/user/credits", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }

        return res.json();
      })
      .then((data) => {
        if (data?.balance !== undefined) {
          setCreditsSnapshot({
            userId,
            balance: data.balance,
          })
        }
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [isLoaded, userId]);

  const credits =
    creditsSnapshot && creditsSnapshot.userId === userId
      ? creditsSnapshot.balance
      : null;

  if (!isLoaded) {
    return null;
  }

  if (!userId) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <SignInButton mode="modal">
          <Button
            variant="ghost"
            className="h-10 rounded-full border border-white/10 bg-white/5 px-3 text-white hover:bg-white/10 sm:px-4"
          >
            Sign In
          </Button>
        </SignInButton>

        <SignUpButton mode="modal">
          <Button className="h-10 rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90 sm:px-5">
            Get Started
          </Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {credits !== null && (
        <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 text-[11px] font-medium text-primary shadow-[0_10px_30px_rgba(16,185,129,0.12)] sm:h-10 sm:text-xs">
          <Coins className="size-3.5" />
          <span>{credits}</span>
        </div>
      )}

      <Link href="/pricing">
        <Button className="h-9 rounded-full border border-primary/30 bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(16,185,129,0.22)] hover:bg-primary/90 sm:h-10 sm:px-5 sm:text-sm">
          <span className="sm:hidden">Upgrade</span>
          <span className="hidden sm:inline">Upgrade</span>
        </Button>
      </Link>

      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1a1d21] shadow-[0_12px_24px_rgba(0,0,0,0.22)] sm:size-11">
        <VireonUserButton avatarBox="h-8 w-8 sm:h-9 sm:w-9" />
      </div>
    </div>
  );
}
