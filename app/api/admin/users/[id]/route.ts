import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("📝 Update user request received")

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string }
    } catch (error) {
      console.error("JWT verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const updates = await request.json()
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const success = await db.updateUser(userId, updates)

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
    }

    console.log("✅ User updated successfully")
    return NextResponse.json({
      success: true,
      message: "User updated successfully"
    })
  } catch (error) {
    console.error("💥 Update user error:", error)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ Delete user request received")

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string }
    } catch (error) {
      console.error("JWT verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const userId = params.id

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const success = await db.deleteUser(userId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 })
    }

    console.log("✅ User deleted successfully")
    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })
  } catch (error) {
    console.error("💥 Delete user error:", error)
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
