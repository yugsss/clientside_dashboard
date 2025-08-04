import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function POST(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    const body = await request.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json({ error: "emoji is required" }, { status: 400 })
    }

    const frameioService = createFrameioService()
    const reaction = await frameioService.addReaction(params.commentId, emoji)

    return NextResponse.json({ reaction })
  } catch (error) {
    console.error("Failed to add Frame.io reaction:", error)
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
  }
}
