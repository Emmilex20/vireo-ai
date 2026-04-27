import { NextResponse } from "next/server";
import { getAppRuntimeConfig } from "@vireon/db";

export async function GET() {
  const config = await getAppRuntimeConfig();

  return NextResponse.json({
    backgroundMode: config.backgroundMode,
    exportsEnabled: config.backgroundMode === "workers"
  });
}
