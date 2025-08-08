import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; role: string }
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { title, description, googleDriveLink, requirements } = await request.json()

    if (!title || !description || !googleDriveLink) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get user to check project limits
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if user can create new project
    if (user.max_projects !== -1 && user.active_projects >= user.max_projects) {
      return NextResponse.json({ success: false, error: "Project limit reached" }, { status: 400 })
    }

    // Create Frame.io project (placeholder for now)
    const frameioProjectId = `frameio_${Date.now()}`

    // Create project in database
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .insert({
        title,
        description,
        google_drive_link: googleDriveLink,
        requirements,
        client_id: decoded.userId,
        frameio_project_id: frameioProjectId,
        status: "pending",
        progress: 0,
        revisions: 0,
        max_revisions: user.max_revisions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (projectError) {
      console.error("Error creating project:", projectError)
      return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 })
    }

    // Update user's active project count
    await supabaseAdmin
      .from("users")
      .update({ active_projects: user.active_projects + 1 })
      .eq("id", decoded.userId)

    // Create notification for admin
    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: decoded.userId,
        title: "New Project Created",
        message: `Project "${title}" has been created and is awaiting assignment.`,
        type: "project_update",
        project_id: project.id,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        progress: project.progress
      }
    })
  } catch (error) {
    console.error("Project creation error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
