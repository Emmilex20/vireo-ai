import type { Metadata } from "next";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Use | Vireon AI",
  description:
    "Read the platform terms covering acceptable use, creator content, billing, and public publishing on Vireon AI.",
  alternates: {
    canonical: absoluteUrl("/terms-of-use")
  },
};

export default function TermsOfUsePage() {
  return (
    <PublicSiteFrame>
      <LegalPage
        eyebrow="Terms"
        title="Terms of Use"
        intro="These terms describe the rules for accessing and using Vireon AI, including creator content, subscriptions, and public publishing features."
      >
        <LegalSection title="Using the platform">
          <p>
            You agree to use Vireon AI lawfully and responsibly. You may not use
            the service to violate rights, upload harmful material, abuse billing
            systems, or interfere with platform reliability.
          </p>
        </LegalSection>

        <LegalSection title="Creator content">
          <p>
            You are responsible for the prompts, uploads, projects, and public
            posts you create or publish. You should only submit content you have
            the right to use and share.
          </p>
        </LegalSection>

        <LegalSection title="Public publishing">
          <p>
            Publishing content makes it eligible for display on public creator
            pages, asset pages, and explore surfaces. You should review content
            before publishing and avoid sharing private or sensitive material.
          </p>
        </LegalSection>

        <LegalSection title="Credits, payments, and subscriptions">
          <p>
            Paid features may use credits, one-time purchases, or subscriptions.
            Pricing, included usage, and renewal behavior are described at checkout
            and may change over time. Failed payments, refunds, and cancellations
            are handled according to the billing flow available in the product.
          </p>
        </LegalSection>

        <LegalSection title="Availability and changes">
          <p>
            We may update features, pricing, usage limits, or policies as the
            platform evolves. We may also suspend or restrict accounts that violate
            these terms or create risk to the service or community.
          </p>
        </LegalSection>

        <LegalSection title="Disclaimer">
          <p>
            Vireon AI is provided on an as-available basis. We aim for reliability
            and quality, but we cannot guarantee uninterrupted service, flawless AI
            output, or suitability for every use case.
          </p>
        </LegalSection>
      </LegalPage>
    </PublicSiteFrame>
  );
}
