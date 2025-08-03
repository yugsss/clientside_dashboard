"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { ProjectsView } from "../projects/projects-view"
import { NotificationsContent } from "../notifications-content"
import { SettingsContent } from "../settings-content"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState("dashboard")

  const renderContent = () => {
    switch (activeView) {
      case "projects":
        return <ProjectsView />
      case "notifications":
        return <NotificationsContent />
      case "settings":
        return <SettingsContent />
      default:
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
