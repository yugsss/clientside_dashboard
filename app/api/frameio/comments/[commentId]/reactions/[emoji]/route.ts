import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function DELETE(request: NextRequest, { params }: { params: { commentId: string; emoji: string } }) {
  try {
    const frameioService = createFrameioService()
    await frameioService.removeReaction(params.commentId, params.emoji)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove Frame.io reaction:", error)
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 })
  }
}
