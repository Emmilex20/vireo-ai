import { db } from "./index";

export async function getAdminPublicAssets() {
  return db.asset.findMany({
    where: {
      isPublic: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      },
      generationJob: true,
      _count: {
        select: {
          likes: true,
          saves: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}

export async function adminUnpublishAsset(params: {
  assetId: string;
  adminId: string;
  note?: string;
}) {
  return db.$transaction(async (tx) => {
    const asset = await tx.asset.update({
      where: { id: params.assetId },
      data: { isPublic: false },
    });

    await tx.moderationAuditLog.create({
      data: {
        assetId: params.assetId,
        adminId: params.adminId,
        action: "unpublish",
        note: params.note?.trim() || null,
      },
    });

    return asset;
  });
}
