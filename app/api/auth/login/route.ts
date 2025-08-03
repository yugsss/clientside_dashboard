import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 API: Login request received")

    const body = await request.json()
    const { email, password } = body

    console.log("📧 API: Login attempt for email:", email)

    if (!email || !password) {
      console.log("❌ API: Missing email or password")
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    const user = await db.getUserByEmail(email)

    if (!user) {
      console.log("❌ API: User not found:", email)
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // For demo purposes, all accounts use "demo123" password
    if (password !== "demo123") {
      console.log("❌ API: Invalid password for user:", email)
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    await db.updateUserLastLogin(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    console.log("✅ API: Login successful for:", email)

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    })

    // Set session cookie
    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("💥 API: Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
