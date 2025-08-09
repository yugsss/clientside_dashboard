import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("📝 Update editor task request received")

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

    const updates = await request.json()
    const taskId = params.id

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    // Add completion timestamp if status is being set to completed
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    }

    const success = await db.updateEditorTask(taskId, updates)

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 })
    }

    console.log("✅ Editor task updated successfully")
    return NextResponse.json({
      success: true,
      message: "Task updated successfully"
    })
  } catch (error) {
    console.error("💥 Update editor task error:", error)
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
    console.log("🗑️ Delete editor task request received")

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

    const taskId = params.id

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    // For now, we'll just mark the task as deleted by updating its status
    // In a real system, you might want to soft delete or archive tasks
    const success = await db.updateEditorTask(taskId, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    })

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 })
    }

    console.log("✅ Editor task deleted successfully")
    return NextResponse.json({
      success: true,
      message: "Task deleted successfully"
    })
  } catch (error) {
    console.error("💥 Delete editor task error:", error)
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
