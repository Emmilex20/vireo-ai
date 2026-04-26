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
            className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Sign In
          </Button>
        </SignInButton>

        <SignUpButton mode="modal">
          <Button className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            Get Started
          </Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {credits !== null && (
        <div className="hidden items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white sm:flex">
          {credits} credits
        </div>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
      >
        <Bell className="size-4" />
      </Button>

      <Link href="/studio">
        <Button className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
          Go to Studio
        </Button>
      </Link>

      <div className="rounded-full border border-white/10 bg-white/5 p-1">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9"
            }
          }}
        />
      </div>
    </div>
  );
}
