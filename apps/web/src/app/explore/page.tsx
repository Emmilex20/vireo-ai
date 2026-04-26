import { InternalExploreClient } from "@/components/explore/internal-explore-client";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicExplorePage() {
  return (
    <>
      <SiteHeader />
      <PageShell className="py-6 sm:py-8">
        <InternalExploreClient />
      </PageShell>
    </>
  );
}
