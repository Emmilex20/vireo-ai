import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { HeaderAuth } from "./header-auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(5,10,11,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:h-16 lg:px-8 lg:py-0">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25">
            <Sparkles className="size-4" />
          </div>

          <div className="min-w-0 flex-col leading-none">
            <span className="block truncate font-(family-name:--font-heading) text-xl font-bold tracking-tight text-white sm:text-lg">
              Vireon AI
            </span>
            <span className="mt-1 block truncate text-[11px] text-slate-400">
              Premium AI creator studio
            </span>
          </div>
        </Link>

        <div className="hidden max-w-md flex-1 md:block">
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
