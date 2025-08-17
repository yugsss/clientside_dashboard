import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authMiddleware } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ["admin"])
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // Get earnings data
    const { data: earnings } = await supabase
      .from("payment_records")
      .select("amount, created_at, plan_name")
      .gte("created_at", startDate.toISOString())
      .eq("status", "completed")

    // Get user metrics
    const { data: users } = await supabase
      .from("users")
      .select("created_at, plan_name, role, is_active")
      .gte("created_at", startDate.toISOString())

    // Get project metrics
    const { data: projects } = await supabase
      .from("projects")
      .select("created_at, status, priority, assigned_editor, assigned_qc")
      .gte("created_at", startDate.toISOString())

    // Calculate analytics
    const totalEarnings = earnings?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const newUsers = users?.length || 0
    const activeProjects = projects?.filter((p) => ["in_progress", "qc_review"].includes(p.status)).length || 0
    const completedProjects = projects?.filter((p) => p.status === "completed").length || 0

    // Plan distribution
    const planDistribution =
      users?.reduce(
        (acc, user) => {
          acc[user.plan_name] = (acc[user.plan_name] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Daily earnings
    const dailyEarnings =
      earnings?.reduce(
        (acc, payment) => {
          const date = new Date(payment.created_at).toISOString().split("T")[0]
          acc[date] = (acc[date] || 0) + payment.amount
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    // Editor workload
    const { data: editorWorkload } = await supabase
      .from("users")
      .select(`
        id, first_name, last_name,
        projects!assigned_editor(id, status, priority)
      `)
      .eq("role", "employee")

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEarnings,
          newUsers,
          activeProjects,
          completedProjects,
        },
        planDistribution,
        dailyEarnings,
        editorWorkload:
          editorWorkload?.map((editor) => ({
            id: editor.id,
            name: `${editor.first_name} ${editor.last_name}`,
            activeProjects:
              editor.projects?.filter((p: any) => ["in_progress", "qc_review"].includes(p.status)).length || 0,
            totalProjects: editor.projects?.length || 0,
          })) || [],
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
