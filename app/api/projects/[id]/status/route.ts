import { NextResponse } from "next/server"
import { withAnyAuth } from "@/lib/auth-middleware"
import { supabaseAdmin } from "@/lib/supabase"

export const PUT = withAnyAuth(async (req, { params }) => {
  try {
    const projectId = params.id
    const { status, progress, notes } = await req.json()
    const user = req.user!

    // Get current project
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("*, client:users!projects_client_id_fkey(name, email)")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Validate permissions
    const canUpdate =
      user.role === "admin" ||
      (user.role === "employee" && project.assigned_editor_id === user.id) ||
      (user.role === "qc" && project.assigned_qc_id === user.id) ||
      (user.role === "client" && project.client_id === user.id)

    if (!canUpdate) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["assigned", "cancelled"],
      assigned: ["in_progress", "cancelled"],
      in_progress: ["qc_review", "client_review", "cancelled"],
      qc_review: ["in_progress", "client_review", "cancelled"],
      client_review: ["in_progress", "completed", "cancelled"],
      completed: [],
      cancelled: [],
    }

    if (status && !validTransitions[project.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${project.status} to ${status}` },
        { status: 400 },
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (progress !== undefined) updateData.progress = Math.max(0, Math.min(100, progress))
    if (notes) updateData.notes = notes

    // Update project
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .select("*")
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update project status" }, { status: 500 })
    }

    // Log activity
    const activityDetails = []
    if (status) activityDetails.push(`Status: ${status}`)
    if (progress !== undefined) activityDetails.push(`Progress: ${progress}%`)
    if (notes) activityDetails.push(`Notes: ${notes}`)

    await supabaseAdmin.from("project_activity").insert({
      project_id: projectId,
      user_id: user.id,
      action: status ? "progress_updated" : "updated",
      details: `Project updated by ${user.name} - ${activityDetails.join(", ")}`,
      metadata: { status, progress, notes, previousStatus: project.status },
      created_at: new Date().toISOString(),
    })

    // Create notifications based on status change
    const notifications = []

    if (status === "qc_review" && project.assigned_qc_id) {
      notifications.push({
        user_id: project.assigned_qc_id,
        title: "QC Review Required",
        message: `Project "${project.title}" is ready for quality control review`,
        type: "project_update",
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      })
    }

    if (status === "client_review") {
      notifications.push({
        user_id: project.client_id,
        title: "Project Ready for Review",
        message: `Your project "${project.title}" is ready for your review and approval`,
        type: "project_update",
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      })
    }

    if (status === "completed") {
      notifications.push({
        user_id: project.client_id,
        title: "Project Completed",
        message: `Your project "${project.title}" has been completed and is ready for download`,
        type: "project_update",
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      })
    }

    if (status === "in_progress" && project.assigned_editor_id && user.role !== "employee") {
      notifications.push({
        user_id: project.assigned_editor_id,
        title: "Project Status Update",
        message: `Project "${project.title}" status has been updated and requires your attention`,
        type: "project_update",
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      })
    }

    if (notifications.length > 0) {
      await supabaseAdmin.from("notifications").insert(notifications)
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Project status updated successfully",
    })
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: "Failed to update project status" }, { status: 500 })
  }
})
