import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { HeaderAuth } from "./header-auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <Sparkles className="size-4" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-(family-name:--font-heading) text-lg font-bold tracking-tight">
              Vireon AI
            </span>
            <span className="text-[10px] text-muted-foreground">
              Create beyond imagination
            </span>
          </div>
        </Link>

        <div className="hidden max-w-md flex-1 md:block">
          <div className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-muted-foreground">
            <Search className="size-4" />
            <span>Search creators, prompts, visuals...</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
