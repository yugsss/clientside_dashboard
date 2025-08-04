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
  Zap,
  Star,
  Gem,
} from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"
import { useState, useEffect } from "react"
import { VideoPlayerWithComments } from "../video/video-player-with-comments"

const planFeatures = {
  basic: {
    name: "Basic Plan",
    icon: Zap,
    color: "bg-gray-100 text-gray-800",
    projects: 1,
    storage: "1GB",
    features: ["Basic editing tools", "Standard export", "Email support"],
    limits: { projects: 1, collaborators: 1, downloads: 10 },
  },
  monthly: {
    name: "Monthly Plan",
    icon: Star,
    color: "bg-blue-100 text-blue-800",
    projects: 10,
    storage: "10GB",
    features: ["Advanced editing", "HD export", "Collaboration tools", "Priority support"],
    limits: { projects: 10, collaborators: 5, downloads: 100 },
  },
  premium: {
    name: "Premium Plan",
    icon: Crown,
    color: "bg-purple-100 text-purple-800",
    projects: 25,
    storage: "50GB",
    features: ["Professional tools", "HD downloads", "Advanced analytics", "Premium support"],
    limits: { projects: 25, collaborators: 15, downloads: 500 },
  },
  ultimate: {
    name: "Ultimate Plan",
    icon: Gem,
    color: "bg-gold-100 text-gold-800",
    projects: "Unlimited",
    storage: "500GB",
    features: ["All features", "4K downloads", "White-label", "Dedicated support"],
    limits: { projects: -1, collaborators: -1, downloads: -1 },
  },
}

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
  const [stats, setStats] = useState({
    projectsUsed: 0,
    storageUsed: 0,
    collaborators: 0,
    downloadsThisMonth: 0,
  })

  // Ensure user is loaded
  useEffect(() => {
    if (!user) {
      useAuthStore.getState().checkAuth()
    }
  }, [user])

  // Get current plan features
  const currentPlan = user?.plan ? planFeatures[user.plan.id as keyof typeof planFeatures] : planFeatures.basic
  const PlanIcon = currentPlan.icon

  useEffect(() => {
    // Simulate loading user stats based on plan
    setStats({
      projectsUsed: Math.floor(Math.random() * (currentPlan.limits.projects > 0 ? currentPlan.limits.projects : 10)),
      storageUsed: Math.floor(Math.random() * 80),
      collaborators: Math.floor(
        Math.random() * (currentPlan.limits.collaborators > 0 ? currentPlan.limits.collaborators : 5),
      ),
      downloadsThisMonth: Math.floor(
        Math.random() * (currentPlan.limits.downloads > 0 ? currentPlan.limits.downloads : 50),
      ),
    })
  }, [currentPlan])

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Safely access user properties with defaults
  const userProjects = user.projects || []
  const userPlan = user.plan || {
    id: "basic",
    name: "Basic",
    price: 0,
    type: "per-video",
    features: [],
    canRequestNewProject: true,
    activeProjects: 0,
    projectsUsed: 0,
    projectLimit: 1,
  }

  const activeProject = userProjects.find((p) => p.status === "in_progress" || p.status === "in_review")

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
      case "monthly":
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
      case "monthly":
        return { text: "Save $100", color: "bg-green-500/20 text-green-400 border-green-500/30" }
      case "premium":
        return { text: "Most Popular", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
      case "ultimate":
        return { text: "Our Best Offering", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
      default:
        return null
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const handleNewProject = async () => {
    if (!newProjectData.title.trim() || !newProjectData.description.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await requestNewProject(newProjectData)
      if (result.success) {
        setShowNewProjectDialog(false)
        setNewProjectData({ title: "", description: "" })
        setActiveTab("active")
      } else {
        setError(result.error || "Failed to create project")
      }
    } catch (error) {
      setError("Failed to create project")
    }

    setLoading(false)
  }

  const handleApproveProject = async () => {
    if (!selectedProject) return

    setLoading(true)
    try {
      const result = await approveProject(selectedProject.id)
      if (result.success) {
        setShowApprovalDialog(false)
        setSelectedProject(null)
      } else {
        setError(result.error || "Failed to approve project")
      }
    } catch (error) {
      setError("Failed to approve project")
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

    try {
      const result = await requestRevision(selectedProject.id, revisionFeedback)
      if (result.success) {
        setShowRevisionDialog(false)
        setRevisionFeedback("")
        setSelectedProject(null)
      } else {
        setError(result.error || "Failed to request revision")
      }
    } catch (error) {
      setError("Failed to request revision")
    }

    setLoading(false)
  }

  const statsCards = [
    {
      title: "Total Projects",
      value: userProjects.length,
      subtitle: `${userProjects.filter((p) => p.status === "completed").length} completed`,
      icon: Video,
      iconColor: "text-blue-400",
    },
    {
      title: "Total Spent",
      value: `$${user.totalSpent || 0}`,
      subtitle: `Since ${user.memberSince || "N/A"}`,
      icon: DollarSign,
      iconColor: "text-green-400",
    },
    {
      title: "Revisions Used",
      value: userProjects.reduce((sum, p) => sum + (p.revisions || 0), 0),
      subtitle: "Across all projects",
      icon: RotateCcw,
      iconColor: "text-yellow-400",
    },
    {
      title: "Member Since",
      value: user.memberSince || "N/A",
      subtitle: `${user.memberDays || 0} days`,
      icon: CalendarDays,
      iconColor: "text-purple-400",
    },
  ]

  const planBadge = getPlanBadge(userPlan.id)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user.name}!</h1>
              <p className="text-slate-400">Manage your video projects and track progress</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <PlanIcon className="h-6 w-6" />
            <Badge className={currentPlan.color}>{currentPlan.name}</Badge>
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
          <div className={`h-1 bg-gradient-to-r ${getPlanColor(userPlan.id)}`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${getPlanColor(userPlan.id)} rounded-lg flex items-center justify-center`}
                >
                  {userPlan.id === "ultimate" ? (
                    <Crown className="h-5 w-5 text-white" />
                  ) : (
                    <Check className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl font-bold text-white">{userPlan.name}</CardTitle>
                    {planBadge && <Badge className={planBadge.color}>{planBadge.text}</Badge>}
                  </div>
                  <p className="text-slate-400 text-lg font-semibold">
                    ${userPlan.price}/{userPlan.type === "monthly" ? "month" : "video"}
                  </p>
                </div>
              </div>
              {userPlan.id !== "ultimate" && (
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Monthly Plans Progress */}
            {userPlan.type === "monthly" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium">
                    {userPlan.id === "ultimate" ? "Projects This Month" : "Projects Used This Month"}
                  </span>
                  <span className="text-white font-bold">
                    {userPlan.projectsUsed || 0}
                    {userPlan.projectLimit === "unlimited" ? " ∞" : `/${userPlan.projectLimit || 1}`}
                  </span>
                </div>
                {userPlan.projectLimit !== "unlimited" && (
                  <Progress
                    value={((userPlan.projectsUsed || 0) / ((userPlan.projectLimit as number) || 1)) * 100}
                    className="h-2 mb-2"
                  />
                )}
                <div className="flex items-center text-slate-400 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {userPlan.projectLimit === "unlimited" ? "Unlimited projects • " : ""}
                  Resets on {userPlan.monthlyReset ? new Date(userPlan.monthlyReset).toLocaleDateString() : "2/1/2024"}
                </div>
              </div>
            )}

            {/* Active Project Status */}
            <div className="flex items-center justify-between py-3 border-t border-slate-700">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${(userPlan.activeProjects || 0) > 0 ? "bg-orange-400" : "bg-green-500"}`}
                />
                <span className="text-slate-300 font-medium">
                  {(userPlan.activeProjects || 0) > 0 ? "Active Project" : "Ready for New Project"}
                </span>
              </div>
              <span className="text-white font-bold">{userPlan.activeProjects || 0}/1</span>
            </div>

            {/* Action Button */}
            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button
                  className={`w-full ${
                    userPlan.canRequestNewProject && (userPlan.activeProjects || 0) === 0
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed hover:bg-slate-600"
                  }`}
                  disabled={!userPlan.canRequestNewProject || (userPlan.activeProjects || 0) > 0}
                >
                  {userPlan.canRequestNewProject && (userPlan.activeProjects || 0) === 0 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Request New Project
                    </>
                  ) : (userPlan.activeProjects || 0) > 0 ? (
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
                {(userPlan.features || []).map((feature, index) => (
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
                  <VideoPlayerWithComments project={activeProject} comments={[]} onAddComment={() => {}} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProjects.map((project) => (
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
            {userProjects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No projects yet</h3>
                <p className="text-slate-400">Start by requesting your first project!</p>
              </div>
            )}
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
