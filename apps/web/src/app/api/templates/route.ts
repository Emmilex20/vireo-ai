import { NextResponse } from "next/server";
import { getPublishedTemplates } from "@vireon/db";

export async function GET() {
  try {
    const templates = await getPublishedTemplates();

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("[templates] Failed to load published templates", error);
    return NextResponse.json({ templates: [], fallback: true });
  }
}
