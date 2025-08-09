import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Get QC personnel request received")

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

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const db = DatabaseService.getInstance()

    const qcPersonnel = await db.getAllQCPersonnel()

    console.log("✅ QC personnel retrieved successfully")
    return NextResponse.json({
      success: true,
      qc: qcPersonnel.map((qc) => ({
        id: qc.id,
        name: qc.name,
        email: qc.email,
        avatar: qc.avatar,
        active_projects: qc.active_projects,
      })),
    })
  } catch (error) {
    console.error("💥 Get QC personnel error:", error)
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
