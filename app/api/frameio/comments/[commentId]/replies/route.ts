import { type NextRequest, NextResponse } from "next/server"
import { frameioService } from "@/lib/frameio"

export async function POST(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    const { commentId } = params
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "Reply text is required",
        },
        { status: 400 },
      )
    }

    const reply = await frameioService.replyToComment(commentId, text)

    if (!reply) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create Frame.io reply",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      reply,
    })
  } catch (error) {
    console.error("Frame.io create reply API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create Frame.io reply",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
