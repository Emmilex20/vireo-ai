"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center gap-2 sm:gap-3">
      {credits !== null && (
        <div className="flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-medium text-primary sm:border-white/10 sm:bg-white/5 sm:px-4 sm:py-1 sm:text-white">
          {credits} credits
        </div>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="hidden size-10 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 sm:inline-flex"
      >
        <Bell className="size-4" />
      </Button>

      <Link href="/studio">
        <Button className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:px-5">
          <span className="sm:hidden">Studio</span>
          <span className="hidden sm:inline">Go to Studio</span>
        </Button>
      </Link>

      <div className="shrink-0 rounded-full border border-white/10 bg-white/5 p-1">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 sm:h-9 sm:w-9"
            }
          }}
        />
      </div>
    </div>
  );
}
