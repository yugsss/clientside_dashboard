import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    const frameioService = createFrameioService()
    const comment = await frameioService.getComment(params.commentId)

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Failed to fetch Frame.io comment:", error)
    return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    const body = await request.json()

    const frameioService = createFrameioService()
    const comment = await frameioService.updateComment(params.commentId, body)

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Failed to update Frame.io comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    const frameioService = createFrameioService()
    await frameioService.deleteComment(params.commentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete Frame.io comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
