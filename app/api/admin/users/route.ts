import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("👥 Get users request received")

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

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const editors = await db.getAllEditors()
    const qcPersonnel = await db.getAllQCPersonnel()

    console.log("✅ Users retrieved successfully")
    return NextResponse.json({
      success: true,
      users: {
        editors: editors.map((editor) => ({
          id: editor.id,
          name: editor.name,
          email: editor.email,
          role: editor.role,
          avatar: editor.avatar,
          active_projects: editor.active_projects || 0,
          is_active: editor.is_active,
          created_at: editor.created_at,
          last_login: editor.last_login,
        })),
        qc: qcPersonnel.map((qc) => ({
          id: qc.id,
          name: qc.name,
          email: qc.email,
          role: qc.role,
          avatar: qc.avatar,
          active_projects: qc.active_projects || 0,
          is_active: qc.is_active,
          created_at: qc.created_at,
          last_login: qc.last_login,
        })),
      },
    })
  } catch (error) {
    console.error("💥 Get users error:", error)
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

export async function POST(request: NextRequest) {
  try {
    console.log("👤 Create user request received")

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

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!['employee', 'qc'].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const user = await db.createUser({
      name,
      email,
      password,
      role,
      createdBy: decoded.userId
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    // Create default settings for the new user
    try {
      await db.createDefaultUserSettings(user.id)
    } catch (settingsError) {
      console.warn("Failed to create default settings:", settingsError)
    }

    // Send notification to the new user
    try {
      await db.createNotification({
        user_id: user.id,
        title: "Welcome to Edit Lobby",
        message: `Your account has been created. You can now log in and start working on projects.`,
        type: "system",
        is_read: false
      })
    } catch (notificationError) {
      console.warn("Failed to create welcome notification:", notificationError)
    }

    console.log("✅ User created successfully")
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    })
  } catch (error) {
    console.error("💥 Create user error:", error)
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
