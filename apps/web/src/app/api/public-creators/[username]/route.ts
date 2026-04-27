import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getPublicCreatorProfile } from "@vireon/db"

type PublicCreator = Awaited<ReturnType<typeof getPublicCreatorProfile>>;
type PublicCreatorAsset = PublicCreator["assets"][number];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth()
    const { username } = await params
    const creator = await getPublicCreatorProfile(username, userId ?? undefined)

    return NextResponse.json({
      creator: {
        ...creator,
        assets: creator.assets.map((asset: PublicCreatorAsset) => ({
          ...asset,
          mediaType: asset.mediaType === "video" ? "video" : "image",
          sourceImageUrl: asset.generationJob?.sourceImageUrl ?? null,
        })),
      },
    })
  } catch (error: any) {
    if (error.message === "CREATOR_NOT_FOUND") {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to load creator" }, { status: 500 })
  }
}
