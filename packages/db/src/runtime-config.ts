import { db } from "./index";

export const APP_RUNTIME_CONFIG_ID = "default";

export type AppBackgroundMode = "inline" | "workers";

export async function getAppRuntimeConfig() {
  return db.appRuntimeConfig.upsert({
    where: { id: APP_RUNTIME_CONFIG_ID },
    update: {},
    create: {
      id: APP_RUNTIME_CONFIG_ID,
      backgroundMode: "inline"
    }
  });
}

export async function getAppBackgroundMode(): Promise<AppBackgroundMode> {
  const config = await getAppRuntimeConfig();

  return config.backgroundMode === "workers" ? "workers" : "inline";
}

export async function setAppBackgroundMode(mode: AppBackgroundMode) {
  return db.appRuntimeConfig.upsert({
    where: { id: APP_RUNTIME_CONFIG_ID },
    update: {
      backgroundMode: mode
    },
    create: {
      id: APP_RUNTIME_CONFIG_ID,
      backgroundMode: mode
    }
  });
}
