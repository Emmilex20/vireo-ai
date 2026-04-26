import { CreatorProfileClient } from "@/components/creator/creator-profile-client"
import { PageShell } from "@/components/layout/page-shell"
import { SiteHeader } from "@/components/layout/site-header"

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <SiteHeader />
      <PageShell className="py-6 sm:py-8">
        <CreatorProfileClient creatorId={id} />
      </PageShell>
    </>
  )
}
