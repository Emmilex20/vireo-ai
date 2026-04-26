import { db } from "./index";

export async function getRecentImageToVideoJobs(userId: string) {
  return db.generationJob.findMany({
    where: {
      userId,
      type: "video",
      sourceImageUrl: {
        not: null
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 6
  });
}
