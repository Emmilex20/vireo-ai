import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, toggleAssetLike, toggleAssetSave } from "@vireon/db"

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  if (!body.assetId || !body.action) {
    return NextResponse.json(
      { error: "Asset ID and action are required" },
      { status: 400 }
    )
  }

  let state: { liked?: boolean; saved?: boolean }

  if (body.action === "like") {
    state = await toggleAssetLike({
      userId,
      assetId: body.assetId,
    })
  } else if (body.action === "save") {
    state = await toggleAssetSave({
      userId,
      assetId: body.assetId,
    })
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const counts = await db.asset.findUnique({
    where: { id: body.assetId },
    select: {
      _count: {
        select: {
          likes: true,
          saves: true,
        },
      },
    },
  })

  return NextResponse.json({
    ...state,
    counts: counts?._count ?? { likes: 0, saves: 0 },
  })
}
