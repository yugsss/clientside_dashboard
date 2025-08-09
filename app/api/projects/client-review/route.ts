import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("👤 Client review request received")

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string }
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { projectId, action, feedback } = await request.json()

    if (!projectId || !action) {
      return NextResponse.json({ success: false, error: "Project ID and action are required" }, { status: 400 })
    }

    if (!["approve", "request_revision"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be 'approve' or 'request_revision'" },
        { status: 400 },
      )
    }

    if (action === "request_revision" && !feedback) {
      return NextResponse.json({ success: false, error: "Feedback is required for revision request" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()

    let success = false

    if (action === "approve") {
      success = await db.approveProjectByClient(projectId, decoded.userId)
    } else {
      success = await db.requestRevisionByClient(projectId, decoded.userId, feedback)
    }

    if (!success) {
      return NextResponse.json({ success: false, error: `Failed to ${action} project` }, { status: 500 })
    }

    console.log(`✅ Project ${action}ed by client successfully`)
    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Project approved successfully" : "Revision requested successfully",
    })
  } catch (error) {
    console.error("💥 Client review error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
