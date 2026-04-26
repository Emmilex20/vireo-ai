import { db } from "./index";

export async function createVideoProject(params: {
  userId: string;
  title: string;
  description?: string;
}) {
  return db.videoProject.create({
    data: {
      userId: params.userId,
      title: params.title.trim(),
      description: params.description?.trim() || null
    },
    include: {
      scenes: {
        orderBy: { order: "asc" }
      }
    }
  });
}

export async function getUserVideoProjects(userId: string) {
  return db.videoProject.findMany({
    where: { userId },
    include: {
      scenes: {
        orderBy: { order: "asc" }
      },
      _count: {
        select: { scenes: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getVideoProjectById(params: {
  userId: string;
  projectId: string;
}) {
  return db.videoProject.findFirst({
    where: {
      id: params.projectId,
      userId: params.userId
    },
    include: {
      scenes: {
        orderBy: { order: "asc" }
      },
      exports: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });
}

export async function createVideoProjectExportAttempt(params: {
  userId: string;
  projectId: string;
  attemptId: string;
  creditsUsed: number;
}) {
  return db.videoProjectExport.create({
    data: {
      userId: params.userId,
      projectId: params.projectId,
      attemptId: params.attemptId,
      status: "queued",
      creditsUsed: params.creditsUsed
    }
  });
}

export async function updateVideoProjectExportAttempt(params: {
  attemptId: string;
  status: string;
  exportUrl?: string | null;
  failureReason?: string | null;
}) {
  return db.videoProjectExport.update({
    where: { attemptId: params.attemptId },
    data: {
      status: params.status,
      exportUrl: params.exportUrl ?? undefined,
      failureReason: params.failureReason ?? undefined,
      completedAt:
        params.status === "completed" || params.status === "failed"
          ? new Date()
          : undefined
    }
  });
}

export async function createVideoScene(params: {
  userId: string;
  projectId: string;
  title?: string;
  prompt: string;
}) {
  const project = await db.videoProject.findFirst({
    where: {
      id: params.projectId,
      userId: params.userId
    },
    include: {
      _count: {
        select: { scenes: true }
      }
    }
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return db.videoScene.create({
    data: {
      projectId: params.projectId,
      order: project._count.scenes + 1,
      title: params.title?.trim() || null,
      prompt: params.prompt.trim()
    }
  });
}

export async function updateVideoScene(params: {
  userId: string;
  sceneId: string;
  title?: string;
  prompt?: string;
}) {
  const scene = await db.videoScene.findFirst({
    where: {
      id: params.sceneId,
      project: {
        userId: params.userId
      }
    }
  });

  if (!scene) {
    throw new Error("SCENE_NOT_FOUND");
  }

  return db.videoScene.update({
    where: { id: params.sceneId },
    data: {
      title: params.title?.trim() || null,
      prompt: params.prompt?.trim() || scene.prompt
    }
  });
}

export async function updateVideoSceneMedia(params: {
  userId: string;
  sceneId: string;
  imageUrl?: string;
  videoUrl?: string;
  status?: string;
  failureReason?: string | null;
}) {
  const scene = await db.videoScene.findFirst({
    where: {
      id: params.sceneId,
      project: {
        userId: params.userId
      }
    }
  });

  if (!scene) {
    throw new Error("SCENE_NOT_FOUND");
  }

  return db.videoScene.update({
    where: { id: params.sceneId },
    data: {
      imageUrl: params.imageUrl ?? scene.imageUrl,
      videoUrl: params.videoUrl ?? scene.videoUrl,
      status: params.status ?? scene.status,
      failureReason: params.failureReason ?? undefined
    }
  });
}

export async function getVideoSceneForUser(params: {
  userId: string;
  sceneId: string;
}) {
  return db.videoScene.findFirst({
    where: {
      id: params.sceneId,
      project: {
        userId: params.userId
      }
    }
  });
}

export async function reorderVideoScenes(params: {
  userId: string;
  projectId: string;
  sceneIds: string[];
}) {
  const project = await db.videoProject.findFirst({
    where: {
      id: params.projectId,
      userId: params.userId
    },
    include: {
      scenes: true
    }
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const validSceneIds = new Set(project.scenes.map((scene) => scene.id));

  const allValid =
    params.sceneIds.length === project.scenes.length &&
    params.sceneIds.every((id) => validSceneIds.has(id));

  if (!allValid) {
    throw new Error("INVALID_SCENE_ORDER");
  }

  await db.$transaction(
    params.sceneIds.map((sceneId, index) =>
      db.videoScene.update({
        where: { id: sceneId },
        data: { order: index + 1 }
      })
    )
  );

  return db.videoProject.findFirst({
    where: {
      id: params.projectId,
      userId: params.userId
    },
    include: {
      scenes: {
        orderBy: { order: "asc" }
      }
    }
  });
}

export async function deleteVideoScene(params: {
  userId: string;
  sceneId: string;
}) {
  const scene = await db.videoScene.findFirst({
    where: {
      id: params.sceneId,
      project: {
        userId: params.userId
      }
    },
    include: {
      project: {
        include: {
          scenes: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  if (!scene) {
    throw new Error("SCENE_NOT_FOUND");
  }

  const remainingScenes = scene.project.scenes.filter(
    (item) => item.id !== scene.id
  );

  await db.$transaction([
    db.videoScene.delete({
      where: { id: scene.id }
    }),
    ...remainingScenes.map((item, index) =>
      db.videoScene.update({
        where: { id: item.id },
        data: { order: index + 1 }
      })
    )
  ]);

  return db.videoProject.findFirst({
    where: {
      id: scene.projectId,
      userId: params.userId
    },
    include: {
      scenes: {
        orderBy: { order: "asc" }
      }
    }
  });
}

export async function updateVideoProjectExport(params: {
  userId: string;
  projectId: string;
  exportStatus?: string;
  exportAttemptId?: string | null;
  exportUrl?: string | null;
  exportFailureReason?: string | null;
}) {
  return db.videoProject.updateMany({
    where: {
      id: params.projectId,
      userId: params.userId
    },
    data: {
      exportStatus: params.exportStatus,
      exportAttemptId: params.exportAttemptId ?? undefined,
      exportFailureReason: params.exportFailureReason ?? undefined,
      exportUrl: params.exportUrl,
      exportedAt: params.exportUrl ? new Date() : undefined
    }
  });
}

export async function publishVideoProjectExportAsAsset(params: {
  userId: string;
  projectId: string;
}) {
  const project = await db.videoProject.findFirst({
    where: {
      id: params.projectId,
      userId: params.userId
    }
  });

  if (!project?.exportUrl) {
    throw new Error("EXPORT_NOT_FOUND");
  }

  return db.asset.create({
    data: {
      userId: params.userId,
      type: "video",
      mediaType: "video",
      title: project.title,
      prompt: project.description || project.title,
      fileUrl: project.exportUrl,
      mimeType: "video/mp4",
      isPublic: true
    }
  });
}
