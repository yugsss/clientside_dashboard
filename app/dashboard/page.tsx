"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "../../components/layout/dashboard-layout"
import { ClientDashboardContent } from "../../components/client/client-dashboard-content"
import { useAuthStore } from "../../stores/auth-store"
import type { Project } from "../../lib/supabase"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockProjects: Project[] = [
      {
        id: "1",
        title: "Product Demo Video",
        description: "Edit our latest product demonstration video",
        status: "in_progress",
        progress: 65,
        revisions: 1,
        max_revisions: 3,
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user?.id || "",
        plan_id: user?.plan_id || "basic",
        frameio_project_id: null,
        frameio_asset_id: null,
        editor_id: null,
        notes: null,
        final_video_url: null,
        updated_at: new Date().toISOString(),
      },
    ]

    setProjects(mockProjects)
    setLoading(false)
  }, [user])

  const handleProjectCreated = () => {
    // Refresh projects list
    // In a real app, this would refetch from the API
    console.log("Project created, refreshing list...")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ClientDashboardContent projects={projects} onProjectCreated={handleProjectCreated} />
    </DashboardLayout>
  )
}
