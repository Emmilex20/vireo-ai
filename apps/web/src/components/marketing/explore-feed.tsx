import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { exploreCards } from "@/lib/mock-data"

import { ExploreCard } from "./explore-card"

export function ExploreFeed() {
  return (
    <section className="mt-10 pb-28 md:pb-12">
      <SectionHeading
        title="Explore"
        description="Discover visual concepts, cinematic generations, and creator-ready inspiration."
        action={
          <Button
            variant="ghost"
            className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            View all
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {exploreCards.map((card) => (
          <ExploreCard
            key={card.id}
            title={card.title}
            creator={card.creator}
            likes={card.likes}
            views={card.views}
            height={card.height as "medium" | "tall" | "wide"}
          />
        ))}
      </div>
    </section>
  )
}
