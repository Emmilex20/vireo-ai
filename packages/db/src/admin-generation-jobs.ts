import { db } from "./index";

export async function getAdminGenerationJobs() {
  return db.generationJob.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}
