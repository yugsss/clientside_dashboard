import { NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { supabaseAdmin } from "@/lib/supabase"

export const GET = withAdminAuth(async (req) => {
  try {
    // Get all editors and QC users with their current workload
    const { data: editors, error: editorsError } = await supabaseAdmin
      .from("users")
      .select(`
        id, name, email, avatar,
        assigned_projects:projects!projects_assigned_editor_id_fkey(
          id, title, status, priority, created_at, due_date
        )
      `)
      .eq("role", "employee")

    const { data: qcUsers, error: qcError } = await supabaseAdmin
      .from("users")
      .select(`
        id, name, email, avatar,
        assigned_projects:projects!projects_assigned_qc_id_fkey(
          id, title, status, priority, created_at, due_date
        )
      `)
      .eq("role", "qc")

    if (editorsError || qcError) {
      throw new Error("Failed to fetch workload data")
    }

    // Calculate workload metrics
    const editorWorkload =
      editors?.map((editor) => {
        const activeProjects =
          editor.assigned_projects?.filter((p) => ["assigned", "in_progress"].includes(p.status)) || []
        const urgentProjects = activeProjects.filter((p) => p.priority === "urgent")
        const overdue = activeProjects.filter((p) => p.due_date && new Date(p.due_date) < new Date())

        return {
          ...editor,
          workload: {
            total: editor.assigned_projects?.length || 0,
            active: activeProjects.length,
            urgent: urgentProjects.length,
            overdue: overdue.length,
            capacity: Math.max(0, 5 - activeProjects.length), // Assuming max 5 active projects
          },
        }
      }) || []

    const qcWorkload =
      qcUsers?.map((qc) => {
        const activeProjects = qc.assigned_projects?.filter((p) => ["qc_review"].includes(p.status)) || []
        const urgentProjects = activeProjects.filter((p) => p.priority === "urgent")

        return {
          ...qc,
          workload: {
            total: qc.assigned_projects?.length || 0,
            active: activeProjects.length,
            urgent: urgentProjects.length,
            overdue: 0, // QC reviews typically don't have due dates
            capacity: Math.max(0, 10 - activeProjects.length), // Assuming max 10 reviews
          },
        }
      }) || []

    // Get unassigned projects
    const { data: unassignedProjects, error: unassignedError } = await supabaseAdmin
      .from("projects")
      .select(`
        id, title, description, priority, created_at, due_date,
        client:users!projects_client_id_fkey(name, email)
      `)
      .eq("status", "pending")
      .is("assigned_editor_id", null)
      .order("created_at", { ascending: true })

    if (unassignedError) {
      throw new Error("Failed to fetch unassigned projects")
    }

    return NextResponse.json({
      editors: editorWorkload,
      qc: qcWorkload,
      unassigned: unassignedProjects || [],
      summary: {
        totalEditors: editorWorkload.length,
        totalQC: qcWorkload.length,
        totalUnassigned: unassignedProjects?.length || 0,
        avgEditorWorkload:
          editorWorkload.reduce((sum, e) => sum + e.workload.active, 0) / Math.max(1, editorWorkload.length),
        avgQCWorkload: qcWorkload.reduce((sum, q) => sum + q.workload.active, 0) / Math.max(1, qcWorkload.length),
      },
    })
  } catch (error) {
    console.error("Workload fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch workload data" }, { status: 500 })
  }
})
