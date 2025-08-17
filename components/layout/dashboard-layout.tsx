"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { ProjectsView } from "../projects/projects-view"
import { NotificationsContent } from "../notifications-content"
import { SettingsContent } from "../settings-content"
import { AdminDashboard } from "../admin/admin-dashboard"
import { EditorDashboard } from "../editor/editor-dashboard"
import { QCDashboard } from "../qc/qc-dashboard"
import { UserManagement } from "../admin/user-management"
import { AdminProjectsView } from "../admin/admin-projects-view"
import { SupportTickets } from "../admin/support-tickets"
import { useAuthStore } from "@/stores/auth-store"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState("dashboard")
  const { user } = useAuthStore()

  const renderContent = () => {
    switch (activeView) {
      case "projects":
        return <ProjectsView />
      case "notifications":
        return <NotificationsContent />
      case "settings":
        return <SettingsContent />
      case "users":
        return <UserManagement />
      case "admin-projects":
        return <AdminProjectsView />
      case "support":
        return <SupportTickets />
      default:
        if (user?.role === "admin") {
          return <AdminDashboard />
        } else if (user?.role === "employee") {
          return <EditorDashboard />
        } else if (user?.role === "qc") {
          return <QCDashboard />
        }
        return children
    }
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
