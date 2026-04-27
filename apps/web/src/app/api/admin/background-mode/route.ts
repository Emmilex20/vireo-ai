import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getAppRuntimeConfig,
  setAppBackgroundMode,
  type AppBackgroundMode
} from "@vireon/db";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function forbidden(userId?: string | null) {
  return !userId || !ADMIN_USER_IDS.includes(userId);
}

export async function GET() {
  const { userId } = await auth();

  if (forbidden(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = await getAppRuntimeConfig();

  return NextResponse.json({
    config,
    features: {
      inlineGeneration: config.backgroundMode === "inline",
      workerQueues: config.backgroundMode === "workers",
      projectExport: config.backgroundMode === "workers"
    }
  });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (forbidden(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const mode = body?.backgroundMode as AppBackgroundMode | undefined;

  if (mode !== "inline" && mode !== "workers") {
    return NextResponse.json(
      { error: "Invalid background mode" },
      { status: 400 }
    );
  }

  try {
    const config = await setAppBackgroundMode(mode);

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("RUNTIME_CONFIG_MIGRATION_REQUIRED")
    ) {
      return NextResponse.json(
        {
          error:
            "Background mode settings are not ready in the production database yet. Apply the latest Prisma migrations first."
        },
        { status: 503 }
      );
    }

    throw error;
  }
}
