import { db } from "./index"

export async function getCreatorFollowLists(userId: string) {
  const [followers, following] = await Promise.all([
    db.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    db.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return {
    followers: followers.map((item: (typeof followers)[number]) => item.follower),
    following: following.map((item: (typeof following)[number]) => item.following),
  }
}
