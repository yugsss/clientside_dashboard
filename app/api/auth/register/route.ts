import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Register request received")

    const { email, password, name, role, company } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Email, password, and name are required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists with this email" }, { status: 409 })
    }

    // Create new user
    const newUser = await db.createUser({
      email,
      password,
      name,
      role: role || "client",
      company,
    })

    if (!newUser) {
      return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    console.log("✅ User registered successfully:", email)
    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("💥 Register error:", error)
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
