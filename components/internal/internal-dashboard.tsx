"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminDashboard } from "./admin-dashboard"
import { EditorDashboard } from "./editor-dashboard"
import { QCDashboard } from "./qc-dashboard"
import { LoginForm } from "@/components/auth/login-form"
import { Crown, User, CheckCircle, LogOut } from "lucide-react"

type DashboardRole = "admin" | "editor" | "qc" | "login"

export function InternalDashboard() {
  const [currentRole, setCurrentRole] = useState<DashboardRole>("admin")

  if (currentRole === "login") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button onClick={() => setCurrentRole("admin")} className="mb-4 w-full" variant="outline">
            ← Back to Dashboard
          </Button>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with Role Switcher */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-8 w-8 rounded object-cover" />
            <h1 className="text-xl font-bold text-white">Edit Lobby - Internal Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentRole("admin")}
                variant={currentRole === "admin" ? "default" : "outline"}
                size="sm"
                className={currentRole === "admin" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <Crown className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button
                onClick={() => setCurrentRole("editor")}
                variant={currentRole === "editor" ? "default" : "outline"}
                size="sm"
                className={currentRole === "editor" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <User className="h-4 w-4 mr-2" />
                Editor
              </Button>
              <Button
                onClick={() => setCurrentRole("qc")}
                variant={currentRole === "qc" ? "default" : "outline"}
                size="sm"
                className={currentRole === "qc" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                QC
              </Button>
            </div>

            {/* Sign Out Button */}
            <Button
              onClick={() => setCurrentRole("login")}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {currentRole === "admin" && <AdminDashboard />}
        {currentRole === "editor" && <EditorDashboard />}
        {currentRole === "qc" && <QCDashboard />}
      </div>
    </div>
  )
}
