import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/creators", label: "Creators" },
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Prompt templates" },
];

const platformLinks = [
  { href: "/studio", label: "Studio" },
  { href: "/app/gallery", label: "Community gallery" },
  { href: "/video-projects", label: "Video projects" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-use", label: "Terms of Use" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

export function PublicSiteFooter({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t border-white/10 bg-[#060b11] ${className ?? ""}`}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.9fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 ring-1 ring-white/10">
                <Image
                  src="/logo.png"
                  alt="Vireon AI"
                  width={40}
                  height={40}
                  className="size-full object-cover"
                />
              </div>
              <div>
                <p className="font-(family-name:--font-heading) text-xl font-bold text-white">
                  Vireon AI
                </p>
                <p className="text-sm text-slate-400">
                  Create image, motion, and multi-scene visual stories.
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              Vireon AI helps creators generate polished visuals, turn still
              images into motion, publish public work, and build longer cinematic
              projects from one creator-first workflow.
            </p>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Platform" links={platformLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Vireon AI. All rights reserved.</p>
          <p>Built for creators who want faster visual workflows with more polish.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h2 className="font-medium text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
