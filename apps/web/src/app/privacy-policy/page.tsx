import type { Metadata } from "next";
import { PublicSiteFrame } from "@/components/layout/public-site-frame";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Vireon AI",
  description:
    "Read how Vireon AI collects, uses, and protects account, billing, and creator content data.",
};

export default function PrivacyPolicyPage() {
  return (
    <PublicSiteFrame>
      <LegalPage
        eyebrow="Privacy"
        title="Privacy Policy"
        intro="This policy explains what information Vireon AI collects, how we use it, and the choices creators have when using the platform."
      >
        <LegalSection title="Information we collect">
          <p>
            We may collect account information such as your name, email address,
            username, profile image, and authentication details through our sign-in
            providers.
          </p>
          <p>
            We also process creator content, including prompts, generated assets,
            project metadata, public posts, billing activity, and support-related
            communication.
          </p>
        </LegalSection>

        <LegalSection title="How we use information">
          <p>
            We use collected information to operate the platform, create and store
            assets, deliver billing and subscription workflows, improve reliability,
            prevent abuse, and support creator discovery features such as public
            profiles and explore feeds.
          </p>
        </LegalSection>

        <LegalSection title="Third-party services">
          <p>
            Vireon AI relies on infrastructure and service providers for
            authentication, payments, storage, analytics, email delivery, and AI
            generation. Those providers may process information strictly as needed
            to deliver their service.
          </p>
        </LegalSection>

        <LegalSection title="Public content">
          <p>
            When you choose to publish an asset or creator profile, that content
            may become visible on public pages such as explore, creator profiles,
            asset detail pages, and search engine results.
          </p>
        </LegalSection>

        <LegalSection title="Retention and security">
          <p>
            We retain information for as long as needed to operate the platform,
            meet legal obligations, resolve disputes, and keep account history
            accurate. We use reasonable technical and operational safeguards to
            protect stored data.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <p>
            You can update profile information, remove public visibility from
            eligible content, and discontinue use of the platform at any time.
            Some records may remain where required for billing, fraud prevention,
            compliance, or operational integrity.
          </p>
        </LegalSection>
      </LegalPage>
    </PublicSiteFrame>
  );
}
