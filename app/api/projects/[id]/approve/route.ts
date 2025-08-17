import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authMiddleware } from "@/lib/auth-middleware"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authMiddleware(request, ["client"])
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await request.json()
    const { action, feedback, reason } = body // action: 'approve' | 'reject'

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user owns the project
    if (project.client_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if project is ready for approval
    if (project.status !== "client_review") {
      return NextResponse.json({ error: "Project is not ready for approval" }, { status: 400 })
    }

    let newStatus: string
    let activityAction: string
    let activityDetails: string
    let notificationTitle: string
    let notificationMessage: string

    if (action === "approve") {
      newStatus = "completed"
      activityAction = "client_approved"
      activityDetails = feedback ? `Project approved with feedback: ${feedback}` : "Project approved by client"
      notificationTitle = "Project Approved"
      notificationMessage = `"${project.title}" has been approved by the client`
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
      }
      newStatus = "rejected"
      activityAction = "client_rejected"
      activityDetails = `Project rejected: ${reason}`
      notificationTitle = "Project Rejected"
      notificationMessage = `"${project.title}" has been rejected by the client`
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update project status
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        status: newStatus,
        completed_at: action === "approve" ? new Date().toISOString() : null,
        client_feedback: feedback || reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Update project error:", updateError)
      return NextResponse.json({ error: "Failed to update project status" }, { status: 500 })
    }

    // Create activity log
    await supabase.from("project_activities").insert({
      project_id: params.id,
      user_id: authResult.user.id,
      action: activityAction,
      details: activityDetails,
      metadata: { feedback, reason },
    })

    // Create notifications for team members
    const notifications = []

    if (project.assigned_editor_id) {
      notifications.push({
        user_id: project.assigned_editor_id,
        title: notificationTitle,
        message: notificationMessage,
        type: "project_update",
        project_id: params.id,
        action_url: `/projects/${params.id}`,
      })
    }

    if (project.assigned_qc_id) {
      notifications.push({
        user_id: project.assigned_qc_id,
        title: notificationTitle,
        message: notificationMessage,
        type: "project_update",
        project_id: params.id,
        action_url: `/projects/${params.id}`,
      })
    }

    // Notify admin users
    const { data: adminUsers } = await supabase.from("users").select("id").eq("role", "admin")

    if (adminUsers) {
      adminUsers.forEach((admin) => {
        notifications.push({
          user_id: admin.id,
          title: notificationTitle,
          message: notificationMessage,
          type: "project_update",
          project_id: params.id,
          action_url: `/projects/${params.id}`,
        })
      })
    }

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications)
    }

    // If approved, update user statistics
    if (action === "approve") {
      await supabase.rpc("increment_user_completed_projects", {
        user_id: project.assigned_editor_id,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        project_id: params.id,
        status: newStatus,
        action,
        message: action === "approve" ? "Project approved successfully" : "Project rejected",
      },
    })
  } catch (error) {
    console.error("Project approval error:", error)
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 })
  }
}
