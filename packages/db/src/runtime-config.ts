import { db } from "./index";

export const APP_RUNTIME_CONFIG_ID = "default";

export type AppBackgroundMode = "inline" | "workers";

function isMissingRuntimeConfigTable(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("appruntimeconfig") &&
    (message.includes("does not exist") ||
      message.includes("no such table") ||
      message.includes("invalid `db.appruntimeconfig") ||
      message.includes("the table"))
  );
}

export async function getAppRuntimeConfig() {
  try {
    return await db.appRuntimeConfig.upsert({
      where: { id: APP_RUNTIME_CONFIG_ID },
      update: {},
      create: {
        id: APP_RUNTIME_CONFIG_ID,
        backgroundMode: "inline"
      }
    });
  } catch (error) {
    if (isMissingRuntimeConfigTable(error)) {
      return {
        id: APP_RUNTIME_CONFIG_ID,
        backgroundMode: "inline",
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    throw error;
  }
}

export async function getAppBackgroundMode(): Promise<AppBackgroundMode> {
  const config = await getAppRuntimeConfig();

  return config.backgroundMode === "workers" ? "workers" : "inline";
}

export async function setAppBackgroundMode(mode: AppBackgroundMode) {
  try {
    return await db.appRuntimeConfig.upsert({
      where: { id: APP_RUNTIME_CONFIG_ID },
      update: {
        backgroundMode: mode
      },
      create: {
        id: APP_RUNTIME_CONFIG_ID,
        backgroundMode: mode
      }
    });
  } catch (error) {
    if (isMissingRuntimeConfigTable(error)) {
      throw new Error(
        "RUNTIME_CONFIG_MIGRATION_REQUIRED: Apply the latest Prisma migrations before changing background mode."
      );
    }

    throw error;
  }
}
