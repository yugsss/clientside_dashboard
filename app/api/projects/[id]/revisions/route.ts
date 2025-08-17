import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authMiddleware } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authMiddleware(request, ["client", "admin", "employee", "qc"])
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { data: revisions, error } = await supabase
      .from("project_revisions")
      .select(`
        *,
        requested_by:users!requested_by_id(id, first_name, last_name, email),
        resolved_by:users!resolved_by_id(id, first_name, last_name, email)
      `)
      .eq("project_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch revisions" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: revisions })
  } catch (error) {
    console.error("Revisions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch revisions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authMiddleware(request, ["client"])
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await request.json()
    const { description, priority = "medium", category, timestamp, frameio_comment_id } = body

    // Get project and user plan details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        client:users!client_id(id, plan_name, plan_features)
      `)
      .eq("id", params.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user owns the project
    if (project.client_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get current revision count
    const { data: existingRevisions, error: revisionCountError } = await supabase
      .from("project_revisions")
      .select("id")
      .eq("project_id", params.id)
      .eq("status", "completed")

    if (revisionCountError) {
      return NextResponse.json({ error: "Failed to check revision count" }, { status: 500 })
    }

    const currentRevisions = existingRevisions?.length || 0

    // Check plan limits
    const planLimits = {
      basic: 1,
      "monthly-pass": 2,
      premium: 3,
      ultimate: -1, // unlimited
    }

    const userPlan = project.client.plan_name.toLowerCase()
    const maxRevisions = planLimits[userPlan as keyof typeof planLimits] || 1

    if (maxRevisions !== -1 && currentRevisions >= maxRevisions) {
      return NextResponse.json(
        {
          error: "Revision limit exceeded",
          details: `Your ${project.client.plan_name} plan allows ${maxRevisions} revision${maxRevisions === 1 ? "" : "s"}. You have used ${currentRevisions}.`,
        },
        { status: 402 },
      )
    }

    // Create revision request
    const { data: revision, error: createError } = await supabase
      .from("project_revisions")
      .insert({
        project_id: params.id,
        requested_by_id: authResult.user.id,
        description,
        priority,
        category,
        timestamp,
        frameio_comment_id,
        status: "pending",
      })
      .select()
      .single()

    if (createError) {
      console.error("Create revision error:", createError)
      return NextResponse.json({ error: "Failed to create revision request" }, { status: 500 })
    }

    // Update project status
    await supabase
      .from("projects")
      .update({
        status: "revision_requested",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    // Create activity log
    await supabase.from("project_activities").insert({
      project_id: params.id,
      user_id: authResult.user.id,
      action: "revision_requested",
      details: `Revision requested: ${description}`,
      metadata: { priority, category, timestamp },
    })

    // Create notifications for assigned team members
    if (project.assigned_editor_id) {
      await supabase.from("notifications").insert({
        user_id: project.assigned_editor_id,
        title: "Revision Requested",
        message: `Client has requested revisions for "${project.title}"`,
        type: "project_update",
        project_id: params.id,
        action_url: `/projects/${params.id}`,
      })
    }

    return NextResponse.json({ success: true, data: revision })
  } catch (error) {
    console.error("Revision request error:", error)
    return NextResponse.json({ error: "Failed to create revision request" }, { status: 500 })
  }
}
