import Link from "next/link";

export default function BillingFailedPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[800px] items-center justify-center px-4 py-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-400">
          Payment failed
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white">
          Payment was not completed
        </h1>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          No credits were added. You can try again from the pricing page.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm text-primary transition hover:bg-primary/15"
          >
            Try again
          </Link>

          <Link
            href="/billing"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Billing overview
          </Link>
        </div>
      </section>
    </main>
  );
}
