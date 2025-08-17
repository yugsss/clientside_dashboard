"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Video,
  Bell,
  Settings,
  LogOut,
  User,
  FileText,
  MessageSquare,
  Crown,
  Menu,
  X,
  CheckCircle,
  Edit,
  Shield,
} from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
  }

  if (!user) return null

  const getNavigationItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "projects", label: "Projects", icon: Video },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "settings", label: "Settings", icon: Settings },
    ]

    if (user.role === "admin") {
      return [
        ...baseItems,
        { id: "users", label: "User Management", icon: User, section: "admin" },
        { id: "admin-projects", label: "All Projects", icon: FileText, section: "admin" },
        { id: "support", label: "Support Tickets", icon: MessageSquare, section: "admin" },
      ]
    }

    if (user.role === "employee") {
      return [
        { id: "dashboard", label: "Editor Dashboard", icon: Edit },
        { id: "projects", label: "My Projects", icon: Video },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }

    if (user.role === "qc") {
      return [
        { id: "dashboard", label: "QC Dashboard", icon: Shield },
        { id: "projects", label: "Review Queue", icon: CheckCircle },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()
  const adminItems = navigationItems.filter((item) => item.section === "admin")
  const mainItems = navigationItems.filter((item) => !item.section)

  return (
    <div
      className={`bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-8 w-8 rounded object-cover" />
              <div>
                <h2 className="text-lg font-semibold text-white">Edit Lobby</h2>
                <p className="text-xs text-slate-400">Video Collaboration</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-8 w-8 rounded object-cover mx-auto" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-purple-600 text-white">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                {user.plan?.id === "ultimate" && <Crown className="h-4 w-4 text-orange-400" />}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {user.role === "client" && (
                  <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300 border-purple-600/30">
                    {user.plan?.name || "Basic Plan"}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {mainItems.map((item) => {
            const isActive = activeView === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  isActive
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                } ${isCollapsed ? "px-2" : "px-3"}`}
                onClick={() => setActiveView(item.id)}
              >
                <item.icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && item.label}
              </Button>
            )
          })}
        </div>

        {/* Admin Section */}
        {adminItems.length > 0 && !isCollapsed && (
          <div className="mt-8">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Admin</div>
            <div className="space-y-2">
              {adminItems.map((item) => {
                const isActive = activeView === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                    onClick={() => setActiveView(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className={`w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white ${
            isCollapsed ? "px-2" : "px-3"
          }`}
          onClick={handleLogout}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
