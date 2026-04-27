import { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,28,0.98),rgba(10,16,24,0.94))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
        <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
          {eyebrow}
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-300">{intro}</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-300">
          {children}
        </div>
      </section>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}
