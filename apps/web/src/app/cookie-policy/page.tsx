import type { Metadata } from "next";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cookie Policy | Vireon AI",
  description:
    "Learn how Vireon AI uses cookies and similar technologies for sessions, preferences, analytics, and product security.",
  alternates: {
    canonical: absoluteUrl("/cookie-policy")
  },
};

export default function CookiePolicyPage() {
  return (
    <PublicSiteFrame>
      <LegalPage
        eyebrow="Cookies"
        title="Cookie Policy"
        intro="This page explains how Vireon AI uses cookies and similar technologies to keep sessions working, improve performance, and understand product usage."
      >
        <LegalSection title="Essential cookies">
          <p>
            Essential cookies help with sign-in state, security, fraud prevention,
            and core product functionality. These are generally required for the
            platform to work correctly.
          </p>
        </LegalSection>

        <LegalSection title="Preference and performance cookies">
          <p>
            We may use cookies or local storage to remember UI preferences,
            improve navigation, and support a more stable product experience
            across sessions.
          </p>
        </LegalSection>

        <LegalSection title="Analytics and diagnostics">
          <p>
            We may use analytics or observability tools to understand page usage,
            reliability, and performance. These tools help us improve the product
            and respond to issues faster.
          </p>
        </LegalSection>

        <LegalSection title="Managing cookies">
          <p>
            Most browsers let you control or disable cookies. Limiting some
            cookies may affect sign-in, billing, or creator workflows on the
            platform.
          </p>
        </LegalSection>
      </LegalPage>
    </PublicSiteFrame>
  );
}
