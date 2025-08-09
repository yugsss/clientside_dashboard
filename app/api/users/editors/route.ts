import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("👥 Get editors request received")

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

    const editors = await db.getAllEditors()

    console.log("✅ Editors retrieved successfully")
    return NextResponse.json({
      success: true,
      editors: editors.map((editor) => ({
        id: editor.id,
        name: editor.name,
        email: editor.email,
        avatar: editor.avatar,
        active_projects: editor.active_projects,
      })),
    })
  } catch (error) {
    console.error("💥 Get editors error:", error)
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
