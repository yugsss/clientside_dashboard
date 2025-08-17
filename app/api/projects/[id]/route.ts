import { NextResponse } from "next/server"
import { withAnyAuth } from "@/lib/auth-middleware"
import { supabaseAdmin } from "@/lib/supabase"

export const GET = withAnyAuth(async (req, { params }) => {
  try {
    const projectId = params.id
    const user = req.user!

    // Get project with related data
    let query = supabaseAdmin
      .from("projects")
      .select(`
        *,
        client:users!projects_client_id_fkey(id, name, email, avatar),
        assigned_editor:users!projects_assigned_editor_id_fkey(id, name, email),
        assigned_qc:users!projects_assigned_qc_id_fkey(id, name, email),
        project_activity(*)
      `)
      .eq("id", projectId)

    // Role-based access control
    if (user.role === "client") {
      query = query.eq("client_id", user.id)
    }

    const { data: project, error } = await query.single()

    if (error || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
})

export const PUT = withAnyAuth(async (req, { params }) => {
  try {
    const projectId = params.id
    const user = req.user!
    const updates = await req.json()

    // Role-based update permissions
    let allowedUpdates: string[] = []
    if (user.role === "admin") {
      allowedUpdates = ["status", "assigned_editor_id", "assigned_qc_id", "priority", "due_date", "progress"]
    } else if (user.role === "employee" || user.role === "qc") {
      allowedUpdates = ["status", "progress", "notes"]
    } else if (user.role === "client") {
      allowedUpdates = ["title", "description", "requirements"]
    }

    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    filteredUpdates.updated_at = new Date().toISOString()

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .update(filteredUpdates)
      .eq("id", projectId)
      .select("*")
      .single()

    if (error || !project) {
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
    }

    // Log activity
    await supabaseAdmin.from("project_activity").insert({
      project_id: projectId,
      user_id: user.id,
      action: "progress_updated",
      details: `Project updated by ${user.name}`,
      metadata: filteredUpdates,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
})
