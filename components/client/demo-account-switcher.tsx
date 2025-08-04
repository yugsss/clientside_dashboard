"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, User, Crown, Star, Zap } from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"

const demoUsers = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/placeholder-user.jpg",
    role: "client" as const,
    company: "Creative Studios",
    plan: {
      id: "basic",
      name: "Basic Plan",
      price: 45,
      type: "per_video" as const,
      features: ["One professional video edit", "48-hour turnaround", "2 rounds of revisions"],
      projectLimit: 1,
      projectsUsed: 0,
      activeProjects: 0,
      canRequestNewProject: true,
      maxRevisions: 2,
    },
    projects: [],
    totalSpent: 135,
    memberSince: "Jan 2024",
    memberDays: 45,
  },
  {
    id: "mike-chen",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: "/placeholder-user.jpg",
    role: "client" as const,
    company: "Tech Innovations",
    plan: {
      id: "monthly_pass",
      name: "Monthly Pass",
      price: 350,
      type: "monthly" as const,
      features: ["10 videos per month", "48-hour turnaround per video", "2 rounds of revisions per video"],
      projectLimit: 10,
      projectsUsed: 3,
      activeProjects: 1,
      canRequestNewProject: false,
      monthlyReset: "2024-02-01",
      maxRevisions: 2,
    },
    projects: [
      {
        id: "project-mike-1",
        title: "Product Demo Video",
        name: "Product Demo Video",
        description: "Showcase our new software features",
        status: "in_progress" as const,
        priority: "high" as const,
        progress: 75,
        clientId: "mike-chen",
        videoUrl: "/placeholder.mp4",
        thumbnailUrl: "/placeholder.jpg",
        duration: 120,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z",
        dueDate: "2024-01-25T23:59:59Z",
        revisions: 1,
        maxRevisions: 2,
        canApprove: false,
        canRequestRevision: true,
      },
    ],
    totalSpent: 1050,
    memberSince: "Nov 2023",
    memberDays: 85,
  },
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    email: "alex@example.com",
    avatar: "/placeholder-user.jpg",
    role: "client" as const,
    company: "Marketing Pro",
    plan: {
      id: "premium",
      name: "Premium Plan",
      price: 500,
      type: "per_video" as const,
      features: ["One premium edit", "3-4 day turnaround", "2 rounds of revisions"],
      projectLimit: 1,
      projectsUsed: 0,
      activeProjects: 1,
      canRequestNewProject: false,
      maxRevisions: 2,
    },
    projects: [
      {
        id: "project-alex-1",
        title: "Brand Campaign Video",
        name: "Brand Campaign Video",
        description: "High-end promotional video for our new campaign",
        status: "in_review" as const,
        priority: "urgent" as const,
        progress: 100,
        clientId: "alex-rivera",
        videoUrl: "/placeholder.mp4",
        thumbnailUrl: "/placeholder.jpg",
        duration: 180,
        createdAt: "2024-01-10T09:00:00Z",
        updatedAt: "2024-01-22T14:00:00Z",
        dueDate: "2024-01-28T23:59:59Z",
        revisions: 0,
        maxRevisions: 2,
        canApprove: true,
        canRequestRevision: true,
      },
    ],
    totalSpent: 1500,
    memberSince: "Oct 2023",
    memberDays: 95,
  },
  {
    id: "emma-thompson",
    name: "Emma Thompson",
    email: "emma@example.com",
    avatar: "/placeholder-user.jpg",
    role: "client" as const,
    company: "Enterprise Corp",
    plan: {
      id: "ultimate",
      name: "Ultimate Plan",
      price: 999,
      type: "monthly" as const,
      features: ["One active project a day", "24-hour turnaround per edit", "Multiple rounds of revisions per video"],
      projectLimit: "unlimited" as const,
      projectsUsed: 12,
      activeProjects: 0,
      canRequestNewProject: true,
      monthlyReset: "2024-02-01",
      maxRevisions: 999,
    },
    projects: [
      {
        id: "project-emma-1",
        title: "Corporate Training Series",
        name: "Corporate Training Series",
        description: "Multi-part training video series for employees",
        status: "completed" as const,
        priority: "medium" as const,
        progress: 100,
        clientId: "emma-thompson",
        videoUrl: "/placeholder.mp4",
        thumbnailUrl: "/placeholder.jpg",
        duration: 300,
        createdAt: "2024-01-05T08:00:00Z",
        updatedAt: "2024-01-18T16:00:00Z",
        completedAt: "2024-01-18T16:00:00Z",
        revisions: 2,
        maxRevisions: 999,
        canApprove: false,
        canRequestRevision: false,
      },
    ],
    totalSpent: 2997,
    memberSince: "Sep 2023",
    memberDays: 125,
  },
]

export function DemoAccountSwitcher() {
  const { user, setUser } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleAccountSwitch = (selectedUser: (typeof demoUsers)[0]) => {
    setUser(selectedUser)
    setIsOpen(false)
    // Refresh the page to update all components
    window.location.reload()
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "basic":
        return <User className="h-4 w-4" />
      case "monthly_pass":
        return <Star className="h-4 w-4" />
      case "premium":
        return <Zap className="h-4 w-4" />
      case "ultimate":
        return <Crown className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "basic":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "monthly_pass":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "premium":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "ultimate":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (!user) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-3 px-3 py-2 h-auto bg-slate-800 hover:bg-slate-700 border border-slate-700"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-purple-600 text-white">{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-white">{user.name}</span>
            <Badge className={`text-xs ${getPlanColor(user.plan?.id || "basic")}`}>
              {user.plan?.name || "Basic Plan"}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-slate-800 border-slate-700" align="end">
        <DropdownMenuLabel className="text-slate-300">Switch Demo Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        {demoUsers.map((demoUser) => (
          <DropdownMenuItem
            key={demoUser.id}
            className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-slate-700 focus:bg-slate-700"
            onClick={() => handleAccountSwitch(demoUser)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={demoUser.avatar || "/placeholder.svg"} alt={demoUser.name} />
              <AvatarFallback className="bg-purple-600 text-white">{demoUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{demoUser.name}</span>
                {user?.id === demoUser.id && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Current</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {getPlanIcon(demoUser.plan.id)}
                <span className="text-sm text-slate-400">{demoUser.plan.name}</span>
                <span className="text-xs text-slate-500">
                  ${demoUser.plan.price}/{demoUser.plan.type === "monthly" ? "month" : "video"}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {demoUser.company} • {demoUser.projects?.length || 0} projects
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
