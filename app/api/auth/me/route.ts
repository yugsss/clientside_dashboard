import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Auth check request received")

    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie) {
      console.log("❌ API: No session cookie found")
      return NextResponse.json({ success: false, error: "No session found" }, { status: 401 })
    }

    const userId = sessionCookie.value
    console.log("🔍 API: Checking session for user ID:", userId)

    const db = DatabaseService.getInstance()
    const user = await db.getUserById(userId)

    if (!user) {
      console.log("❌ API: User not found for session:", userId)
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    console.log("✅ API: Auth check successful for:", user.email)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("💥 API: Auth check error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
