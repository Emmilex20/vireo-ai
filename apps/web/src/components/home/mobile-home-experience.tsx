import { unstable_noStore as noStore } from "next/cache";

import { DesktopHomeExperienceClient } from "./desktop-home-experience-client";
import { getHomeExperienceData } from "./home-experience-data";
import { MobileHomeExperienceClient } from "./mobile-home-experience-client";

export async function MobileHomeExperience() {
  noStore();

  const {
    spotlightCards,
    suiteCards,
    latestModelCards,
    inspirationImageCards,
    inspirationVideoCards,
  } = await getHomeExperienceData();

  return (
    <>
      <div className="lg:hidden">
        <MobileHomeExperienceClient
          spotlightCards={spotlightCards}
          suiteCards={suiteCards.slice(0, 4)}
          inspirationImageCards={inspirationImageCards}
          inspirationVideoCards={inspirationVideoCards}
        />
      </div>

      <DesktopHomeExperienceClient
        spotlightCards={spotlightCards}
        suiteCards={suiteCards}
        latestModelCards={latestModelCards}
        inspirationImageCards={inspirationImageCards}
        inspirationVideoCards={inspirationVideoCards}
      />
    </>
  );
}
