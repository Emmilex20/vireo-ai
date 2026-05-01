import { ClientStudioLayout } from "@/components/studio/studio-layout-client";

type AnimateVideoModelPageProps = {
  params: Promise<{
    modelSlug: string;
  }>;
};

export default async function AnimateVideoModelPage({
  params,
}: AnimateVideoModelPageProps) {
  const { modelSlug } = await params;

  return (
    <main className="mx-auto w-full px-3 py-4 sm:px-6 sm:py-6 lg:max-w-none lg:px-0 lg:py-0">
      <ClientStudioLayout
        initialMode="video"
        initialVideoModelSlug={modelSlug}
      />
    </main>
  );
}
