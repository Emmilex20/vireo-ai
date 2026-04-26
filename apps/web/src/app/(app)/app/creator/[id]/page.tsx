import { CreatorProfileClient } from "@/components/creator/creator-profile-client"

export default async function AppCreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <CreatorProfileClient creatorId={id} />
    </main>
  )
}
