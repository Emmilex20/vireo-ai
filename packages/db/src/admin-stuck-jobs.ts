import { db } from "./index";

export async function getStuckGenerationJobs(minutes = 30) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  return db.generationJob.findMany({
    where: {
      status: "processing",
      createdAt: {
        lt: cutoff
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}
