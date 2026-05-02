import { Suspense } from "react";
import { PricingPageClient } from "@/components/billing/pricing-page-client";
import { AppShell } from "@/components/layout/app-shell";

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <AppShell>
        <PricingPageClient />
      </AppShell>
    </Suspense>
  );
}
