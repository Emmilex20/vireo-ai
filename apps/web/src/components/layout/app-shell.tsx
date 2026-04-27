"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Coins,
  Compass,
  CreditCard,
  FolderOpen,
  History,
  ImageIcon,
  Plus,
  Sparkles,
  UserRound,
  Video
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { CreditsBadge } from "@/components/billing/credits-badge";
import { NotificationNavBadge } from "@/components/notifications/notification-nav-badge";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

type AppShellProps = {
  children: React.ReactNode;
};

const navItems = [
  {
    href: "/studio",
    label: "Create Image",
    title: "Image Studio",
    description: "Build visual ideas with premium prompt controls",
    activeDescription: "Prompt to image workflow",
    icon: ImageIcon
  },
  {
    href: "/assets",
    label: "Assets",
    title: "Assets",
    description: "Manage saved generations and history",
    activeDescription: "Saved generated media",
    icon: FolderOpen
  },
  {
    href: "/video-projects",
    label: "Video projects",
    title: "Video projects",
    description: "Build longer AI videos scene by scene",
    activeDescription: "Multi-scene story workspace",
    icon: Video
  },
  {
    href: "/app/gallery",
    label: "Gallery",
    title: "Gallery",
    description: "Browse public creations and your creator feed",
    activeDescription: "Public creations and followed creators",
    icon: Compass
  },
  {
    href: "/billing",
    label: "Billing",
    title: "Billing",
    description: "Track credits, payments, and generation spend",
    activeDescription: "Billing overview and balance",
    icon: Coins
  },
  {
    href: "/pricing",
    label: "Buy credits",
    title: "Buy credits",
    description: "Purchase more credits for image and video generation",
    activeDescription: "Credit pack pricing",
    icon: Plus
  },
  {
    href: "/billing/payments",
    label: "Payments",
    title: "Payments",
    description: "Review credit pack purchases and payment references",
    activeDescription: "Payment history",
    icon: CreditCard
  },
  {
    href: "/billing/credits",
    label: "Credit history",
    title: "Credit history",
    description: "Review deductions, refunds, and credit movement",
    activeDescription: "Credit activity log",
    icon: History
  },
  {
    href: "/profile",
    label: "Profile",
    title: "Profile",
    description: "Manage your creator account",
    activeDescription: "Account and creator details",
    icon: UserRound
  }
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const activeItem =
    navItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? navItems[0];
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    void fetch("/api/user/sync").catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-black/20 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col p-5">
          <Link
            href="/studio"
            className="flex items-center gap-3"
            data-tour="studio"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="font-(family-name:--font-heading) text-lg font-bold text-white">
                Vireon AI
              </div>
              <div className="text-xs text-muted-foreground">Creator Studio</div>
            </div>
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Active tool
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ActiveIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {activeItem.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeItem.activeDescription}
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem.href === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.href === "/studio" ? "studio" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_rgba(16,185,129,0.08)]"
                      : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Credit-controlled
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This studio is being built with real generation cost control in mind.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/25 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="font-(family-name:--font-heading) text-lg font-semibold text-white">
                {activeItem.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeItem.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                data-tour="gallery"
                href="/app/gallery"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Gallery
              </Link>
              <Link
                data-tour="projects"
                href="/video-projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Video projects
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Billing
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Buy credits
              </Link>
              <Link
                href="/billing/payments"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Payments
              </Link>
              <Link
                href="/billing/credits"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Credit history
              </Link>
              <div data-tour="credits">
                <CreditsBadge />
              </div>
              <NotificationNavBadge />

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
          </div>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
