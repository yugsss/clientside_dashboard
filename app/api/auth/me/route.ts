import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Auth check request received")

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

    // Get user from database
    const user = await db.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Transform user data for response
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || "/placeholder-user.jpg",
      plan: {
        id: user.plan_id,
        name: user.plan_name,
        price: user.plan_price,
        type: user.plan_type,
        features: user.plan_features,
        activeProjects: user.active_projects,
        projectLimit: user.max_projects,
        canRequestNewProject: user.active_projects < user.max_projects,
      },
      permissions: ["view_projects", "comment"],
      totalSpent: user.total_spent,
      memberSince: user.member_since,
      memberDays: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    }

    console.log("✅ Auth check successful for:", user.email)
    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error("💥 Auth check error:", error)
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
