import { PricingPageClient } from "@/components/billing/pricing-page-client";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";

export default function PricingPage() {
  return (
    <PublicSiteFrame>
      <PricingPageClient />
    </PublicSiteFrame>
  );
}
