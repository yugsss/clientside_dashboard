import { type NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login request received")

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()

    // Test database connection
    const isConnected = await db.testConnection()
    if (!isConnected) {
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    // Get user by email
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await db.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Create JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    )

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

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
    })

    response.cookies.set("auth-token", token, {
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
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
