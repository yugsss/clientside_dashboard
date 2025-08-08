"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, Calendar, Bell, Settings } from 'lucide-react'

interface Project {
  id: string
  title: string
  client: string
  editor: string
  status: "qc_review" | "approved" | "rejected"
  priority: "urgent" | "high" | "medium" | "low"
  submittedAt: string
  dueDate: string
  revisionCount: number
  feedback?: string
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Corporate Training Video",
    client: "Acme Corp",
    editor: "John Smith",
    status: "qc_review",
    priority: "urgent",
    submittedAt: "2024-01-16T14:30:00Z",
    dueDate: "2024-01-20",
    revisionCount: 0,
  },
  {
    id: "2",
    title: "Product Launch Promo",
    client: "TechStart Inc",
    editor: "Mike Johnson",
    status: "qc_review",
    priority: "high",
    submittedAt: "2024-01-15T09:15:00Z",
    dueDate: "2024-01-25",
    revisionCount: 1,
  },
  {
    id: "3",
    title: "Event Highlights Reel",
    client: "EventCo",
    editor: "John Smith",
    status: "approved",
    priority: "medium",
    submittedAt: "2024-01-14T16:45:00Z",
    dueDate: "2024-01-18",
    revisionCount: 0,
    feedback: "Excellent work! Ready for client review.",
  },
  {
    id: "4",
    title: "Social Media Campaign",
    client: "Brand Studio",
    editor: "Mike Johnson",
    status: "rejected",
    priority: "low",
    submittedAt: "2024-01-13T11:20:00Z",
    dueDate: "2024-01-15",
    revisionCount: 2,
    feedback:
      "Audio levels need adjustment in the second half. Color correction on the product shots needs to be more vibrant.",
  },
]

export function QCDashboard() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("projects")

  const handleApprove = (projectId: string) => {
    const projectFeedback = feedback[projectId] || "Approved for client review."
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, status: "approved" as const, feedback: projectFeedback } : project,
      ),
    )
    setFeedback((prev) => ({ ...prev, [projectId]: "" }))
  }

  const handleReject = (projectId: string) => {
    const projectFeedback = feedback[projectId]
    if (!projectFeedback?.trim()) {
      alert("Please provide feedback for rejection.")
      return
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              status: "rejected" as const,
              feedback: projectFeedback,
              revisionCount: project.revisionCount + 1,
            }
          : project,
      ),
    )
    setFeedback((prev) => ({ ...prev, [projectId]: "" }))
  }

  const handleFeedbackChange = (projectId: string, value: string) => {
    setFeedback((prev) => ({ ...prev, [projectId]: value }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qc_review":
        return "bg-orange-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    )
  }

  const pendingProjects = projects.filter((p) => p.status === "qc_review")
  const approvedProjects = projects.filter((p) => p.status === "approved")
  const rejectedProjects = projects.filter((p) => p.status === "rejected")

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg">{project.title}</CardTitle>
            <p className="text-slate-400 text-sm">Client: {project.client}</p>
            <p className="text-slate-400 text-sm">Editor: {project.editor}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getPriorityColor(project.priority)} text-white`}>{project.priority}</Badge>
            <Badge className={`${getStatusColor(project.status)} text-white`}>{project.status.replace("_", " ")}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span>Submitted: {formatDate(project.submittedAt)}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Calendar className="h-4 w-4" />
            <span>Due: {project.dueDate}</span>
          </div>
        </div>

        {/* Revision Count */}
        {project.revisionCount > 0 && (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-400">Revision #{project.revisionCount + 1}</span>
          </div>
        )}

        {/* Existing Feedback */}
        {project.feedback && project.status !== "qc_review" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Previous Feedback
            </h4>
            <div className="bg-slate-600 rounded p-3 text-sm text-slate-200">{project.feedback}</div>
          </div>
        )}

        {/* QC Actions for Pending Projects */}
        {project.status === "qc_review" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Feedback {project.status === "qc_review" ? "(Required for rejection)" : ""}
              </label>
              <Textarea
                placeholder="Provide detailed feedback for the editor..."
                value={feedback[project.id] || ""}
                onChange={(e) => handleFeedbackChange(project.id, e.target.value)}
                className="bg-slate-600 border-slate-500 text-white placeholder-slate-400"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button onClick={() => handleApprove(project.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button onClick={() => handleReject(project.id)} variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Request Revision
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-10 w-10 rounded object-cover" />
          <div>
            <h1 className="text-3xl font-bold text-white">QC Dashboard</h1>
            <p className="text-slate-400 mt-1">Review and approve video projects</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("notifications")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("settings")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger
            value="projects"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Projects
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{pendingProjects.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{approvedProjects.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{rejectedProjects.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Approval Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((approvedProjects.length / (approvedProjects.length + rejectedProjects.length)) * 100) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Tabs */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
                Pending Review ({pendingProjects.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-slate-700">
                Approved ({approvedProjects.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-slate-700">
                Rejected ({rejectedProjects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {approvedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rejectedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">QC Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                <p className="text-slate-400">QC notifications will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">QC Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Settings</h3>
                <p className="text-slate-400">QC preferences and configuration options will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">QC Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Analytics</h3>
                <p className="text-slate-400">QC performance metrics and analytics will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
