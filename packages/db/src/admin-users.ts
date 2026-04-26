import { db } from "./index";

export async function getAdminUsersOverview() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      createdAt: true,
      wallet: {
        select: {
          balance: true,
        },
      },
      _count: {
        select: {
          assets: true,
          jobs: true,
          payments: true,
          followers: true,
          following: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}
