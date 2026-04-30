import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { HeaderAuth } from "./header-auth";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/creators", label: "Creators" },
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Templates" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(5,10,11,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:h-16 lg:px-8 lg:py-0">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 ring-1 ring-white/10">
            <Image
              src="/logo.png"
              alt="Vireon AI"
              width={40}
              height={40}
              className="size-full object-cover"
              priority
            />
          </div>

          <div className="min-w-0 flex-col leading-none">
            <span className="block truncate font-(family-name:--font-heading) text-[1.1rem] font-bold tracking-tight text-white sm:text-lg">
              Vireon AI
            </span>
            <span className="mt-1 hidden truncate text-[11px] text-slate-400 sm:block">
              Premium AI creator studio
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden max-w-sm flex-1 xl:block">
          <div className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-muted-foreground">
            <Search className="size-4" />
            <span>Search creators, prompts, visuals...</span>
          </div>
        </div>

        <div className="shrink-0">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
