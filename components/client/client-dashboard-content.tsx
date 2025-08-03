"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Video,
  DollarSign,
  RotateCcw,
  Calendar,
  Check,
  TrendingUp,
  FileText,
  BarChart3,
  CalendarDays,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"
import { useState } from "react"
import { DemoAccountSwitcher } from "./demo-account-switcher"
import { VideoPlayerWithComments } from "../video/video-player-with-comments"
import { demoComments } from "../../lib/demo-data"

export function ClientDashboardContent() {
  const { user, requestNewProject, approveProject, requestRevision } = useAuthStore()
  const [activeTab, setActiveTab] = useState("overview")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRevisionDialog, setShowRevisionDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [newProjectData, setNewProjectData] = useState({ title: "", description: "" })
  const [revisionFeedback, setRevisionFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!user) return null

  const activeProject = user.projects?.find((p) => p.status === "in_progress" || p.status === "in_review")
  const projectComments = demoComments.filter((c) => c.projectId === activeProject?.id)

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "active", label: "Active Project", icon: Video, disabled: !activeProject },
    { id: "all", label: "All Projects", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ]

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "basic":
        return "from-blue-500 to-blue-600"
      case "monthly_pass":
        return "from-green-500 to-green-600"
      case "premium":
        return "from-purple-500 to-purple-600"
      case "ultimate":
        return "from-orange-500 to-orange-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getPlanBadge = (planId: string) => {
    switch (planId) {
      case "monthly_pass":
        return { text: "Save $100", color: "bg-green-500/20 text-green-400 border-green-500/30" }
      case "premium":
        return { text: "Most Popular", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
      case "ultimate":
        return { text: "Our Best Offering", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
      default:
        return null
    }
  }

  const handleNewProject = async () => {
    if (!newProjectData.title.trim() || !newProjectData.description.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    const result = await requestNewProject(newProjectData)

    if (result.success) {
      setShowNewProjectDialog(false)
      setNewProjectData({ title: "", description: "" })
      setActiveTab("active")
    } else {
      setError(result.error || "Failed to create project")
    }

    setLoading(false)
  }

  const handleApproveProject = async () => {
    if (!selectedProject) return

    setLoading(true)
    const result = await approveProject(selectedProject.id)

    if (result.success) {
      setShowApprovalDialog(false)
      setSelectedProject(null)
    } else {
      setError(result.error || "Failed to approve project")
    }

    setLoading(false)
  }

  const handleRequestRevision = async () => {
    if (!selectedProject || !revisionFeedback.trim()) {
      setError("Please provide revision feedback")
      return
    }

    setLoading(true)
    setError("")

    const result = await requestRevision(selectedProject.id, revisionFeedback)

    if (result.success) {
      setShowRevisionDialog(false)
      setRevisionFeedback("")
      setSelectedProject(null)
    } else {
      setError(result.error || "Failed to request revision")
    }

    setLoading(false)
  }

  const statsCards = [
    {
      title: "Total Projects",
      value: user.projects?.length || 0,
      subtitle: `${user.projects?.filter((p) => p.status === "completed").length || 0} completed`,
      icon: Video,
      iconColor: "text-blue-400",
    },
    {
      title: "Total Spent",
      value: `$${user.totalSpent}`,
      subtitle: `Since ${user.memberSince}`,
      icon: DollarSign,
      iconColor: "text-green-400",
    },
    {
      title: "Revisions Used",
      value: user.projects?.reduce((sum, p) => sum + (p.revisions || 0), 0) || 0,
      subtitle: "Across all projects",
      icon: RotateCcw,
      iconColor: "text-yellow-400",
    },
    {
      title: "Member Since",
      value: user.memberSince,
      subtitle: `${user.memberDays} days`,
      icon: CalendarDays,
      iconColor: "text-purple-400",
    },
  ]

  const planBadge = getPlanBadge(user.plan.id)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EL</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user.name}!</h1>
              <p className="text-slate-400">Manage your video projects and track progress</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DemoAccountSwitcher />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Active Project Alert */}
        {activeProject && (
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-200">
              <div className="flex items-center justify-between">
                <span>Active project in progress</span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Project In Progress</Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Summary Card */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${getPlanColor(user.plan.id)}`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${getPlanColor(user.plan.id)} rounded-lg flex items-center justify-center`}
                >
                  {user.plan.id === "ultimate" ? (
                    <Crown className="h-5 w-5 text-white" />
                  ) : (
                    <Check className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl font-bold text-white">{user.plan.name}</CardTitle>
                    {planBadge && <Badge className={planBadge.color}>{planBadge.text}</Badge>}
                  </div>
                  <p className="text-slate-400 text-lg font-semibold">
                    ${user.plan.price}/{user.plan.type === "monthly" ? "month" : "video"}
                  </p>
                </div>
              </div>
              {user.plan.id !== "ultimate" && user.plan.canRequestNewProject && (
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Monthly Plans Progress */}
            {user.plan.type === "monthly" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium">
                    {user.plan.id === "ultimate" ? "Projects This Month" : "Projects Used This Month"}
                  </span>
                  <span className="text-white font-bold">
                    {user.plan.projectsUsed}
                    {user.plan.projectLimit === "unlimited" ? " ∞" : `/${user.plan.projectLimit}`}
                  </span>
                </div>
                {user.plan.projectLimit !== "unlimited" && (
                  <Progress
                    value={(user.plan.projectsUsed / (user.plan.projectLimit as number)) * 100}
                    className="h-2 mb-2"
                  />
                )}
                <div className="flex items-center text-slate-400 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {user.plan.projectLimit === "unlimited" ? "Unlimited projects • " : ""}
                  Resets on{" "}
                  {user.plan.monthlyReset ? new Date(user.plan.monthlyReset).toLocaleDateString() : "2/1/2024"}
                </div>
              </div>
            )}

            {/* Active Project Status */}
            <div className="flex items-center justify-between py-3 border-t border-slate-700">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${user.plan.activeProjects > 0 ? "bg-orange-400" : "bg-green-500"}`}
                />
                <span className="text-slate-300 font-medium">
                  {user.plan.activeProjects > 0 ? "Active Project" : "Ready for New Project"}
                </span>
              </div>
              <span className="text-white font-bold">{user.plan.activeProjects}/1</span>
            </div>

            {/* Action Button */}
            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button
                  className={`w-full ${
                    user.plan.canRequestNewProject && user.plan.activeProjects === 0
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed hover:bg-slate-600"
                  }`}
                  disabled={!user.plan.canRequestNewProject || user.plan.activeProjects > 0}
                >
                  {user.plan.canRequestNewProject && user.plan.activeProjects === 0 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Request New Project
                    </>
                  ) : user.plan.activeProjects > 0 ? (
                    "Complete Current Project First"
                  ) : (
                    "Request New Project"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Request New Project</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Provide details for your new video editing project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {error && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label htmlFor="title" className="text-slate-300">
                      Project Title
                    </Label>
                    <Input
                      id="title"
                      value={newProjectData.title}
                      onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-slate-300">
                      Project Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newProjectData.description}
                      onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Describe your video project requirements"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewProjectDialog(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleNewProject} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                    {loading ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Plan Features */}
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-400 font-medium mb-3">Plan includes:</p>
              <div className="space-y-2">
                {user.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`flex-1 ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <p className="text-slate-500 text-xs mt-1">{stat.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-slate-700 ${stat.iconColor}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "active" && activeProject && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Info */}
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{activeProject.title}</CardTitle>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      {activeProject.status}
                    </Badge>
                  </div>
                  <p className="text-slate-400">{activeProject.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Progress</span>
                      <span className="text-sm font-medium text-purple-400">{activeProject.progress}%</span>
                    </div>
                    <Progress value={activeProject.progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Revisions Used</span>
                      <span className="text-white">
                        {activeProject.revisions}/
                        {activeProject.maxRevisions === 999 ? "∞" : activeProject.maxRevisions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Due Date</span>
                      <span className="text-white">
                        {activeProject.dueDate ? new Date(activeProject.dueDate).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                  </div>

                  {/* Project Actions */}
                  {activeProject.status === "in_review" && (
                    <div className="space-y-2 pt-4 border-t border-slate-700">
                      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setSelectedProject(activeProject)}
                            disabled={!activeProject.canApprove}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Video
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Approve Project</DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Are you satisfied with the video? Approving will mark the project as completed.
                            </DialogDescription>
                          </DialogHeader>
                          {error && (
                            <Alert className="border-red-500/50 bg-red-500/10">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <AlertDescription className="text-red-200">{error}</AlertDescription>
                            </Alert>
                          )}
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowApprovalDialog(false)}
                              className="border-slate-600 text-slate-300"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleApproveProject}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {loading ? "Approving..." : "Approve Project"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full border-orange-600 text-orange-400 hover:bg-orange-600/10 bg-transparent"
                            onClick={() => setSelectedProject(activeProject)}
                            disabled={!activeProject.canRequestRevision}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request Revision
                            {activeProject.maxRevisions !== 999 && (
                              <span className="ml-2 text-xs">
                                ({activeProject.maxRevisions - activeProject.revisions} left)
                              </span>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Request Revision</DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Describe the changes you'd like to see in the video.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {error && (
                              <Alert className="border-red-500/50 bg-red-500/10">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <AlertDescription className="text-red-200">{error}</AlertDescription>
                              </Alert>
                            )}
                            <div>
                              <Label htmlFor="feedback" className="text-slate-300">
                                Revision Feedback
                              </Label>
                              <Textarea
                                id="feedback"
                                value={revisionFeedback}
                                onChange={(e) => setRevisionFeedback(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Please describe the specific changes you'd like to see..."
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowRevisionDialog(false)}
                              className="border-slate-600 text-slate-300"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleRequestRevision}
                              disabled={loading || !revisionFeedback.trim()}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              {loading ? "Requesting..." : "Request Revision"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Video Player */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Video Review</CardTitle>
                  <p className="text-slate-400">Watch your video and add timestamped feedback</p>
                </CardHeader>
                <CardContent>
                  <VideoPlayerWithComments project={activeProject} comments={projectComments} onAddComment={() => {}} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.projects?.map((project) => (
              <Card key={project.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{project.title}</CardTitle>
                    <Badge
                      className={
                        project.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : project.status === "in_review"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-slate-400">{project.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Progress</span>
                      <span className="text-sm font-medium text-purple-400">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Revisions: {project.revisions}/{project.maxRevisions === 999 ? "∞" : project.maxRevisions}
                      </span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`mx-auto mb-4 p-3 rounded-lg bg-slate-700 w-fit ${stat.iconColor}`}>
                      <stat.icon className="h-8 w-8" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    <p className="text-slate-500 text-xs mt-1">{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
