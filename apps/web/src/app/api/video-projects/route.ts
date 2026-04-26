import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createVideoProject, getUserVideoProjects } from "@vireon/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getUserVideoProjects(userId);

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.title || body.title.trim().length < 3) {
    return NextResponse.json(
      { error: "Project title must be at least 3 characters." },
      { status: 400 }
    );
  }

  const project = await createVideoProject({
    userId,
    title: body.title,
    description: body.description
  });

  return NextResponse.json({ success: true, project });
}
