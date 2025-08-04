import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get("assetId")

    if (!assetId) {
      return NextResponse.json({ error: "assetId is required" }, { status: 400 })
    }

    const frameioService = createFrameioService()
    const comments = await frameioService.getComments(assetId)

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Failed to fetch Frame.io comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId, text, timestamp, annotation, priority, category, tags } = body

    if (!assetId || !text) {
      return NextResponse.json({ error: "assetId and text are required" }, { status: 400 })
    }

    const frameioService = createFrameioService()
    const comment = await frameioService.createComment(assetId, {
      text,
      timestamp,
      annotation,
      priority,
      category,
      tags,
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Failed to create Frame.io comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
