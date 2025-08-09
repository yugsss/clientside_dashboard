import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("📊 Project progress update request received")

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

    const { projectId, progress } = await request.json()

    if (!projectId || progress === undefined) {
      return NextResponse.json({ success: false, error: "Project ID and progress are required" }, { status: 400 })
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json({ success: false, error: "Progress must be between 0 and 100" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()

    const success = await db.updateProjectProgress(projectId, progress, decoded.userId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to update project progress" }, { status: 500 })
    }

    console.log("✅ Project progress updated successfully")
    return NextResponse.json({
      success: true,
      message: "Project progress updated successfully",
    })
  } catch (error) {
    console.error("💥 Project progress update error:", error)
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
