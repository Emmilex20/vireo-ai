import { getAppBackgroundMode } from "@vireon/db";

export type BackgroundMode = "inline" | "workers";

export async function getBackgroundMode(): Promise<BackgroundMode> {
  return getAppBackgroundMode();
}

export async function isWorkersMode() {
  return (await getBackgroundMode()) === "workers";
}
