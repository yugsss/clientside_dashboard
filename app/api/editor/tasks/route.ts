import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("📋 Get editor tasks request received")

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

    // Check if user is editor
    if (decoded.role !== "employee") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const tasks = await db.getEditorTasks(decoded.userId)

    console.log("✅ Editor tasks retrieved successfully")
    return NextResponse.json({
      success: true,
      tasks: tasks || []
    })
  } catch (error) {
    console.error("💥 Get editor tasks error:", error)
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
    console.log("📝 Create editor task request received")

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

    // Check if user is editor
    if (decoded.role !== "employee") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const { project_id, title, description, priority, due_date } = await request.json()

    if (!project_id || !title) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const task = await db.createEditorTask({
      project_id,
      editor_id: decoded.userId,
      title,
      description: description || null,
      status: 'todo',
      priority: priority || 'medium',
      due_date: due_date || null
    })

    if (!task) {
      return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 })
    }

    console.log("✅ Editor task created successfully")
    return NextResponse.json({
      success: true,
      task
    })
  } catch (error) {
    console.error("💥 Create editor task error:", error)
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
