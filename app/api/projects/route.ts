import { NextResponse } from "next/server"
import { withAnyAuth } from "@/lib/auth-middleware"
import { supabaseAdmin } from "@/lib/supabase"

export const GET = withAnyAuth(async (req) => {
  try {
    const user = req.user!
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabaseAdmin
      .from("projects")
      .select(`
        *,
        client:users!projects_client_id_fkey(id, name, email, avatar),
        assigned_editor:users!projects_assigned_editor_id_fkey(id, name, email),
        assigned_qc:users!projects_assigned_qc_id_fkey(id, name, email)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Role-based filtering
    if (user.role === "client") {
      query = query.eq("client_id", user.id)
    } else if (user.role === "employee") {
      query = query.eq("assigned_editor_id", user.id)
    } else if (user.role === "qc") {
      query = query.eq("assigned_qc_id", user.id)
    }

    // Status filtering
    if (status) {
      query = query.eq("status", status)
    }

    const { data: projects, error } = await query

    if (error) {
      throw new Error("Failed to fetch projects")
    }

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
})
