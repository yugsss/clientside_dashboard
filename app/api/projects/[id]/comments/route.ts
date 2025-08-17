import { NextResponse } from "next/server"
import { withAnyAuth } from "@/lib/auth-middleware"
import { supabaseAdmin } from "@/lib/supabase"

export const GET = withAnyAuth(async (req, { params }) => {
  try {
    const projectId = params.id
    const { searchParams } = new URL(req.url)
    const assetId = searchParams.get("assetId")

    let query = supabaseAdmin
      .from("video_comments")
      .select(`
        *,
        user:users!video_comments_user_id_fkey(id, name, email, avatar, role)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    if (assetId) {
      query = query.eq("asset_id", assetId)
    }

    const { data: comments, error } = await query

    if (error) {
      throw new Error("Failed to fetch comments")
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
    })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
})

export const POST = withAnyAuth(async (req, { params }) => {
  try {
    const projectId = params.id
    const user = req.user!
    const { content, timestamp, type, priority, assetId } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    // Verify user has access to this project
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("client_id, assigned_editor_id, assigned_qc_id")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const hasAccess =
      user.role === "admin" ||
      project.client_id === user.id ||
      project.assigned_editor_id === user.id ||
      project.assigned_qc_id === user.id

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Create comment
    const { data: comment, error: commentError } = await supabaseAdmin
      .from("video_comments")
      .insert({
        project_id: projectId,
        user_id: user.id,
        content: content.trim(),
        timestamp: timestamp || null,
        type: type || "general",
        priority: priority || "medium",
        asset_id: assetId || null,
        resolved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:users!video_comments_user_id_fkey(id, name, email, avatar, role)
      `)
      .single()

    if (commentError || !comment) {
      throw new Error("Failed to create comment")
    }

    // Create notifications for relevant users
    const notifications = []

    // Notify client if comment is from editor/QC
    if (user.role !== "client" && project.client_id) {
      notifications.push({
        user_id: project.client_id,
        title: "New Video Comment",
        message: `${user.name} added a comment to your project`,
        type: "project_update",
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      })
    }

    // Notify editor if comment is from client/QC
    if (user.role !== "employee" && project.assigned_editor_id) {
      notifications.push({
        user_id: project.assigned_editor_id,
        title: "New Video Comment",
        message: `${user.name} added a comment to the project`,
        type: "project_update",
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      })
    }

    // Notify QC if comment is revision request
    if (type === "revision" && project.assigned_qc_id) {
      notifications.push({
        user_id: project.assigned_qc_id,
        title: "Revision Request",
        message: `${user.name} requested revisions on the project`,
        type: "project_update",
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      })
    }

    if (notifications.length > 0) {
      await supabaseAdmin.from("notifications").insert(notifications)
    }

    // Log activity
    await supabaseAdmin.from("project_activity").insert({
      project_id: projectId,
      user_id: user.id,
      action: "comment_added",
      details: `${user.name} added a ${type} comment${timestamp ? ` at ${Math.floor(timestamp / 60)}:${String(Math.floor(timestamp % 60)).padStart(2, "0")}` : ""}`,
      metadata: { commentId: comment.id, type, priority, timestamp },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      comment,
      message: "Comment added successfully",
    })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
})
