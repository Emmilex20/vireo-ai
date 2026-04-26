import Link from "next/link";
import { Coins, CreditCard, History, Plus } from "lucide-react";

const links = [
  {
    href: "/billing",
    label: "Billing overview",
    icon: Coins,
  },
  {
    href: "/pricing",
    label: "Buy credits",
    icon: Plus,
  },
  {
    href: "/billing/payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    href: "/billing/subscription",
    label: "Subscription",
    icon: CreditCard,
  },
  {
    href: "/billing/credits",
    label: "Credit history",
    icon: History,
  },
];

export function BillingQuickLinks() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {links.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
          >
            <Icon className="size-5 text-primary" />
            <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
          </Link>
        );
      })}
    </div>
  );
}
