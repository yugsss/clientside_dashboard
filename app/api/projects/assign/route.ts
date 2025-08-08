import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Assign project request received")

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string }
    } catch (error) {
      console.error("JWT verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const { projectId, editorId, qcId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    if (!editorId && !qcId) {
      return NextResponse.json({ success: false, error: "At least one assignee is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    let success = true

    // Assign to editor if provided
    if (editorId) {
      const editorAssignSuccess = await db.assignProjectToEditor(projectId, editorId, decoded.userId)
      if (!editorAssignSuccess) {
        success = false
      }
    }

    // Assign to QC if provided
    if (qcId) {
      const qcAssignSuccess = await db.assignProjectToQC(projectId, qcId, decoded.userId)
      if (!qcAssignSuccess) {
        success = false
      }
    }

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to assign project" }, { status: 500 })
    }

    console.log("✅ Project assigned successfully")
    return NextResponse.json({
      success: true,
      message: "Project assigned successfully"
    })
  } catch (error) {
    console.error("💥 Assign project error:", error)
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
