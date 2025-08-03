import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 API: Registration request received")

    const body = await request.json()
    const { name, email, password, company, role = "client" } = body

    console.log("📧 API: Registration attempt for email:", email)

    if (!name || !email || !password) {
      console.log("❌ API: Missing required fields")
      return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      console.log("❌ API: User already exists:", email)
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const userId = await db.createUser({
      name,
      email,
      password,
      role: role as "admin" | "employee" | "client",
      company,
    })

    console.log("✅ API: Registration successful for:", email, "with ID:", userId)

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      userId,
    })
  } catch (error) {
    console.error("💥 API: Registration error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
