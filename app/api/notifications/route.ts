import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("🔔 Notifications request received")

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "No authentication token" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string }
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const db = DatabaseService.getInstance()

    // Get user notifications
    const notifications = await db.getNotificationsByUserId(decoded.userId)

    console.log("✅ Notifications retrieved for:", decoded.email)

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("💥 Notifications error:", error)
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
