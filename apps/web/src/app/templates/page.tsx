import { Suspense } from "react";

import { TemplatesGalleryClient } from "@/components/templates/templates-gallery-client";

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050606] px-4 py-8 text-white">
          <div className="h-10 w-72 rounded bg-white/10" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-64 rounded-3xl bg-white/5" />
            ))}
          </div>
        </main>
      }
    >
      <TemplatesGalleryClient />
    </Suspense>
  );
}
