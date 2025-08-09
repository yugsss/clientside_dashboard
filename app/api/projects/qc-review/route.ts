import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 QC review request received")

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

    // Check if user is QC
    if (decoded.role !== "qc" && decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const { projectId, action, comments } = await request.json()

    if (!projectId || !action) {
      return NextResponse.json({ success: false, error: "Project ID and action are required" }, { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Action must be 'approve' or 'reject'" }, { status: 400 })
    }

    if (action === "reject" && !comments) {
      return NextResponse.json({ success: false, error: "Comments are required for rejection" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()

    let success = false

    if (action === "approve") {
      success = await db.approveProjectByQC(projectId, decoded.userId, comments)
    } else {
      success = await db.rejectProjectByQC(projectId, decoded.userId, comments)
    }

    if (!success) {
      return NextResponse.json({ success: false, error: `Failed to ${action} project` }, { status: 500 })
    }

    console.log(`✅ Project ${action}ed by QC successfully`)
    return NextResponse.json({
      success: true,
      message: `Project ${action}ed successfully`,
    })
  } catch (error) {
    console.error("💥 QC review error:", error)
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
