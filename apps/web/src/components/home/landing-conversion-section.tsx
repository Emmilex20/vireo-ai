import {
  CheckCircle2,
  Clapperboard,
  GalleryVerticalEnd,
  Sparkles,
  Users
} from "lucide-react";

export function LandingConversionSection() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,18,0.94),rgba(8,14,14,0.98))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="size-3.5" />
            Built for creator workflows
          </div>

          <h2 className="mt-4 max-w-3xl font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create polished visuals, evolve them into motion, and publish the
            work that deserves to travel.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Vireon gives creators one focused system to generate images, turn
            them into motion, publish the best work, and grow a public creative
            identity without switching tools.
          </p>

          <div className="mt-6 grid gap-3">
            <ProofLine text="Generate still visuals, short motion clips, and scene-based stories in one workspace." />
            <ProofLine text="Reuse outputs naturally instead of restarting each workflow from scratch." />
            <ProofLine text="Move from private creation to public discovery through gallery and creator pages." />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <CapabilityCard
            icon={<Clapperboard className="size-5 text-primary" />}
            title="Motion ready"
            text="Animate source images into cinematic clips without leaving the product."
          />
          <CapabilityCard
            icon={<GalleryVerticalEnd className="size-5 text-primary" />}
            title="Portfolio aware"
            text="Publish finished outputs into a public gallery and creator profile."
          />
          <CapabilityCard
            icon={<Users className="size-5 text-primary" />}
            title="Growth loop"
            text="Referrals, follows, and discovery features turn usage into momentum."
          />
        </div>
      </div>
    </section>
  );
}

function ProofLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-4">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}
