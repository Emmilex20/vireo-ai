import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { Readable } from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import {
  db,
  refundProjectExport,
  updateVideoProjectExportAttempt,
  updateVideoProjectExport
} from "@vireon/db";
import { sendExportReadyEmailNotification } from "@/lib/email/notifications";
import { uploadRemoteAssetToCloudinary } from "@/lib/storage/cloudinary";

type ExportProjectScene = {
  order: number;
  videoUrl?: string | null;
};

const streamPipeline = promisify(pipeline);

async function downloadFile(url: string, filepath: string) {
  const res = await fetch(url);

  if (!res.ok || !res.body) {
    throw new Error(`Failed to download scene video: ${url}`);
  }

  const readable = Readable.fromWeb(
    res.body as unknown as NodeReadableStream
  );

  await streamPipeline(readable, fs.createWriteStream(filepath));
}

function stitchVideos(inputPaths: string[], outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const command = ffmpeg();

    inputPaths.forEach((file) => {
      command.input(file);
    });

    command
      .on("end", () => resolve())
      .on("error", (error) => reject(error))
      .mergeToFile(outputPath, os.tmpdir());
  });
}

export async function processProjectExport(
  projectId: string,
  exportAttemptId: string
) {
  const project = await db.videoProject.findUnique({
    where: { id: projectId },
    include: {
      scenes: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.exportAttemptId !== exportAttemptId) {
    return {
      skipped: true,
      reason: "STALE_EXPORT_ATTEMPT"
    };
  }

  const scenesWithVideos = project.scenes.filter(
    (scene: ExportProjectScene) => scene.videoUrl
  );

  if (scenesWithVideos.length === 0) {
    await updateVideoProjectExportAttempt({
      attemptId: exportAttemptId,
      status: "failed",
      failureReason: "No completed scene videos to export"
    });

    await updateVideoProjectExport({
      userId: project.userId,
      projectId,
      exportStatus: "failed",
      exportFailureReason: "No completed scene videos to export"
    });

    await refundProjectExport({
      userId: project.userId,
      projectId,
      exportAttemptId
    });

    throw new Error("No completed scene videos to export");
  }

  await updateVideoProjectExportAttempt({
    attemptId: exportAttemptId,
    status: "processing"
  });

  await updateVideoProjectExport({
    userId: project.userId,
    projectId,
    exportStatus: "processing",
    exportFailureReason: null
  });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "vireon-export-"));
  const outputPath = path.join(workDir, "final.mp4");

  try {
    const inputPaths: string[] = [];

    for (const scene of scenesWithVideos) {
      const filePath = path.join(workDir, `scene-${scene.order}.mp4`);
      await downloadFile(scene.videoUrl!, filePath);
      inputPaths.push(filePath);
    }

    await stitchVideos(inputPaths, outputPath);

    const storageResult = await uploadRemoteAssetToCloudinary({
      url: outputPath,
      folder: "vireon/project-exports",
      resourceType: "video"
    });

    await updateVideoProjectExportAttempt({
      attemptId: exportAttemptId,
      status: "completed",
      exportUrl: storageResult.url
    });

    await updateVideoProjectExport({
      userId: project.userId,
      projectId,
      exportStatus: "completed",
      exportFailureReason: null,
      exportUrl: storageResult.url
    });

    await sendExportReadyEmailNotification({
      userId: project.userId,
      url: storageResult.url
    });

    return {
      success: true,
      exportUrl: storageResult.url
    };
  } catch (error: unknown) {
    await updateVideoProjectExport({
      userId: project.userId,
      projectId,
      exportStatus: "failed",
      exportFailureReason:
        error instanceof Error ? error.message : "Project export failed"
    });

    await updateVideoProjectExportAttempt({
      attemptId: exportAttemptId,
      status: "failed",
      failureReason:
        error instanceof Error ? error.message : "Project export failed"
    });

    await refundProjectExport({
      userId: project.userId,
      projectId,
      exportAttemptId
    });

    throw error;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
