import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login request received")

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const { user, tokens } = await authService.login({ email, password })

    // Transform user data for response with plan information
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
      permissions:
        user.role === "admin"
          ? ["all"]
          : user.role === "employee" || user.role === "qc"
            ? ["view_all_projects", "edit_projects"]
            : ["view_projects", "comment"],
      totalSpent: user.total_spent,
      memberSince: user.member_since,
      memberDays: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    }

    // Set HTTP-only cookie with access token
    const response = NextResponse.json({
      success: true,
      user: userData,
      tokens, // Include tokens for client-side storage if needed
    })

    response.cookies.set("auth-token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes (matches access token expiry)
      path: "/",
    })

    // Set refresh token as separate cookie
    response.cookies.set("refresh-token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("✅ Login successful for:", email)
    return response
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 401 },
    )
  }
}
