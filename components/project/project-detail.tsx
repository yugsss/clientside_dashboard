"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  MessageSquare,
  Edit,
  ExternalLink,
  Upload,
  Play,
  Eye,
  TrendingUp,
  Users,
  FileVideo,
  Star,
  AlertCircle,
  CheckCircle2,
  Timer,
  Target,
} from "lucide-react"
import { FrameIOEmbed } from "../video/frameio-embed"
import { CommentsPanel } from "../video/comments-panel"
import { useProjectsStore } from "../../stores/projects-store"
import { useAuthStore } from "../../stores/auth-store"
import { demoFrameioAssets, demoFrameioComments } from "../../lib/demo-data"
import type { Project } from "../../types"
import type { FrameioComment, FrameioAsset } from "../../lib/frameio"

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onChatOpen: () => void
}

export function ProjectDetail({ project, onBack, onChatOpen }: ProjectDetailProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState("video")
  const [frameioAssets, setFrameioAssets] = useState<FrameioAsset[]>([])
  const [frameioComments, setFrameioComments] = useState<FrameioComment[]>([])
  const [selectedAsset, setSelectedAsset] = useState<FrameioAsset | null>(null)
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState({
    views: 47,
    comments: 12,
    collaborators: 3,
    completion_rate: 85,
    avg_review_time: "2.3 hours",
    last_activity: "2 hours ago",
  })

  const { user } = useAuthStore()
  const { updateProjectStatus } = useProjectsStore()

  // Load demo Frame.io data
  useEffect(() => {
    if (project.frameioProjectId) {
      setLoading(true)
      // Simulate API call with demo data
      setTimeout(() => {
        const assets = demoFrameioAssets.filter((asset) => asset.project_id === project.frameioProjectId)
        setFrameioAssets(assets)

        if (assets.length > 0) {
          setSelectedAsset(assets[0])
          const comments = demoFrameioComments.filter((comment) => comment.asset_id === assets[0].id)
          setFrameioComments(comments)
        }

        setLoading(false)
      }, 1000)
    }
  }, [project.frameioProjectId])

  const handleAddComment = async (
    content: string,
    timestamp: number,
    annotation?: any,
    priority?: string,
    category?: string,
    tags?: string[],
  ) => {
    if (!selectedAsset) return

    const newComment: FrameioComment = {
      id: `comment-${Date.now()}`,
      text: content,
      asset_id: selectedAsset.id,
      author: {
        id: user?.id || "1",
        name: user?.name || "Sarah Johnson",
        email: user?.email || "sarah@creativestudio.com",
        avatar_url: user?.avatar || "/placeholder.svg?height=32&width=32&text=SJ",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      timestamp,
      resolved: false,
      priority: priority as any,
      category,
      tags,
      reactions: {},
      replies_count: 0,
      annotation,
    }

    setFrameioComments((prev) => [...prev, newComment])
  }

  const handleUpdateComment = async (
    commentId: string,
    updates: { text?: string; resolved?: boolean; priority?: string; category?: string; tags?: string[] },
  ) => {
    setFrameioComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              ...updates,
              updated_at: new Date().toISOString(),
              resolved_at: updates.resolved ? new Date().toISOString() : comment.resolved_at,
              resolved_by: updates.resolved ? user?.id : comment.resolved_by,
            }
          : comment,
      ),
    )
  }

  const handleDeleteComment = async (commentId: string) => {
    setFrameioComments((prev) => prev.filter((comment) => comment.id !== commentId))
  }

  const handleReplyToComment = async (commentId: string, text: string) => {
    const newReply: FrameioComment = {
      id: `reply-${Date.now()}`,
      text,
      asset_id: selectedAsset?.id || "",
      author: {
        id: user?.id || "1",
        name: user?.name || "Sarah Johnson",
        email: user?.email || "sarah@creativestudio.com",
        avatar_url: user?.avatar || "/placeholder.svg?height=32&width=32&text=SJ",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved: false,
      reactions: {},
      replies_count: 0,
      parent_comment_id: commentId,
    }

    setFrameioComments((prev) => [...prev, newReply])
  }

  const handleAddReaction = async (commentId: string, emoji: string) => {
    setFrameioComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const reactions = { ...comment.reactions }
          if (!reactions[emoji]) {
            reactions[emoji] = []
          }
          reactions[emoji].push({
            id: user?.id || "1",
            name: user?.name || "Sarah Johnson",
            avatar_url: user?.avatar || "/placeholder.svg?height=32&width=32&text=SJ",
          })
          return { ...comment, reactions }
        }
        return comment
      }),
    )
  }

  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    setFrameioComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const reactions = { ...comment.reactions }
          if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter((user) => user.id !== (user?.id || "1"))
            if (reactions[emoji].length === 0) {
              delete reactions[emoji]
            }
          }
          return { ...comment, reactions }
        }
        return comment
      }),
    )
  }

  const handleStatusUpdate = async (status: Project["status"]) => {
    await updateProjectStatus(project.id, status)
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "in_review":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Timer className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const canEditProject = user?.role === "admin" || (user?.role === "employee" && project.assignedEditor === user.id)

  const unresolvedComments = frameioComments.filter((c) => !c.resolved)
  const highPriorityComments = frameioComments.filter((c) => c.priority === "high" || c.priority === "urgent")

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onChatOpen}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            {project.frameioProjectId && (
              <Button variant="outline" asChild>
                <a
                  href={`https://app.frame.io/projects/${project.frameioProjectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Frame.io
                </a>
              </Button>
            )}
            {canEditProject && (
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  {project.title}
                  <Badge className="ml-3 bg-purple-100 text-purple-800">Frame.io v4</Badge>
                </h1>
                <p className="text-gray-600 mb-4 text-lg">{project.description}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "No deadline"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Client: {project.clientId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Duration:{" "}
                      {project.duration
                        ? `${Math.floor(project.duration / 60)}:${(project.duration % 60).toString().padStart(2, "0")}`
                        : "TBD"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Project Progress</span>
                <span className="text-sm text-gray-500">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>

          {/* Status & Analytics */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                  <div className="flex items-center space-x-1">
                    {getPriorityIcon(project.priority)}
                    <Badge variant="outline" className="capitalize">
                      {project.priority}
                    </Badge>
                  </div>
                </div>
                {project.frameioProjectId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Frame.io ID</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {project.frameioProjectId.slice(-8)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Frame.io Analytics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Frame.io Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-blue-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{analytics.views}</p>
                    <p className="text-xs text-blue-600">Views</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <MessageSquare className="h-4 w-4 text-green-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{analytics.comments}</p>
                    <p className="text-xs text-green-600">Comments</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-purple-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{analytics.collaborators}</p>
                    <p className="text-xs text-purple-600">Collaborators</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 text-orange-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{analytics.completion_rate}%</p>
                    <p className="text-xs text-orange-600">Complete</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Avg Review Time:</span>
                    <span className="font-medium">{analytics.avg_review_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Activity:</span>
                    <span className="font-medium">{analytics.last_activity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Actions for Clients */}
        {user?.role === "client" && project.status === "in_review" && (
          <div className="flex items-center space-x-3 mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Your video is ready for review</p>
              <p className="text-xs text-yellow-600">
                Please review the video using Frame.io's advanced commenting features and provide feedback or approve it
              </p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("in_progress")}>
                Request Changes
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate("completed")}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Project
              </Button>
            </div>
          </div>
        )}

        {/* Comment Summary */}
        {frameioComments.length > 0 && (
          <div className="flex items-center space-x-4 mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{frameioComments.length} total comments</span>
            </div>
            {unresolvedComments.length > 0 && (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">{unresolvedComments.length} unresolved</span>
              </div>
            )}
            {highPriorityComments.length > 0 && (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">{highPriorityComments.length} high priority</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Video & Comments</span>
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center space-x-2">
                <FileVideo className="h-4 w-4" />
                <span>Frame.io Assets</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Project Details</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="video" className="h-full m-0">
              {selectedAsset ? (
                <div className="h-full flex">
                  <div className="flex-1 p-6 bg-black">
                    <FrameIOEmbed
                      asset={selectedAsset}
                      onTimeUpdate={setCurrentTime}
                      onAddComment={(timestamp) => {
                        setActiveTab("video")
                      }}
                      className="h-full rounded-lg overflow-hidden"
                    />
                  </div>
                  <div className="w-96 flex-shrink-0 bg-white border-l border-gray-200">
                    <CommentsPanel
                      assetId={selectedAsset.id}
                      comments={frameioComments}
                      onAddComment={handleAddComment}
                      onUpdateComment={handleUpdateComment}
                      onDeleteComment={handleDeleteComment}
                      onReplyToComment={handleReplyToComment}
                      onAddReaction={handleAddReaction}
                      onRemoveReaction={handleRemoveReaction}
                      currentTime={currentTime}
                      currentUser={user}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileVideo className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Video Selected</h3>
                    <p className="text-gray-600">Select a video asset from the Frame.io Assets tab</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assets" className="h-full m-0 p-6 overflow-y-auto bg-gray-50">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center">
                      <FileVideo className="h-5 w-5 mr-2" />
                      Frame.io Assets
                    </h3>
                    <p className="text-gray-600 mt-1">Manage and review video assets with Frame.io v4 features</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to Frame.io
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Frame.io assets...</p>
                  </div>
                ) : frameioAssets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {frameioAssets.map((asset) => (
                      <Card
                        key={asset.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedAsset?.id === asset.id ? "ring-2 ring-purple-500 shadow-lg" : ""
                        }`}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-t-lg relative overflow-hidden">
                            {asset.thumbnail_url ? (
                              <img
                                src={asset.thumbnail_url || "/placeholder.svg"}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <FileVideo className="h-12 w-12 text-gray-400" />
                              </div>
                            )}

                            {/* Processing Status */}
                            {asset.processing_status !== "completed" && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="bg-black/60 text-white text-xs">
                                  {asset.processing_status === "processing" && (
                                    <>Processing {asset.processing_progress}%</>
                                  )}
                                  {asset.processing_status === "queued" && "Queued"}
                                  {asset.processing_status === "failed" && "Failed"}
                                </Badge>
                              </div>
                            )}

                            {/* Frame.io Badge */}
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-purple-600 text-white text-xs">Frame.io v4</Badge>
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                <Play className="h-6 w-6 text-gray-900 ml-1" />
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            <h4 className="font-semibold text-sm truncate mb-2">{asset.name}</h4>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                              <span className="flex items-center">
                                <FileVideo className="h-3 w-3 mr-1" />
                                {asset.filetype || "video/mp4"}
                              </span>
                              {asset.duration && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, "0")}
                                </span>
                              )}
                            </div>

                            {/* Asset Analytics */}
                            {asset.analytics && (
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="p-2 bg-blue-50 rounded">
                                  <div className="font-semibold text-blue-600">{asset.analytics.view_count}</div>
                                  <div className="text-blue-500">Views</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded">
                                  <div className="font-semibold text-green-600">{asset.analytics.comment_count}</div>
                                  <div className="text-green-500">Comments</div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded">
                                  <div className="font-semibold text-purple-600">{asset.analytics.download_count}</div>
                                  <div className="text-purple-500">Downloads</div>
                                </div>
                              </div>
                            )}

                            {/* Processing Progress */}
                            {asset.processing_status === "processing" && asset.processing_progress !== undefined && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Processing</span>
                                  <span>{asset.processing_progress}%</span>
                                </div>
                                <Progress value={asset.processing_progress} className="h-1" />
                              </div>
                            )}

                            {/* Approval Status */}
                            {asset.approval_status && (
                              <div className="mt-3 flex items-center justify-center">
                                <Badge
                                  className={
                                    asset.approval_status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : asset.approval_status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {asset.approval_status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                  {asset.approval_status === "rejected" && <AlertCircle className="h-3 w-3 mr-1" />}
                                  {asset.approval_status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                  {asset.approval_status}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Frame.io Assets</h3>
                    <p className="text-gray-600 mb-4">Upload assets to Frame.io to get started with v4 features</p>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Asset
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0 p-6 overflow-y-auto bg-gray-50">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Frame.io v4 Analytics
                  </h3>
                  <p className="text-gray-600">Advanced collaboration and engagement metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{analytics.views}</div>
                      <div className="text-sm text-gray-600">Total Views</div>
                      <div className="text-xs text-green-600 mt-1">↗ +12% this week</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-green-600 mb-1">{analytics.comments}</div>
                      <div className="text-sm text-gray-600">Comments</div>
                      <div className="text-xs text-green-600 mt-1">↗ +8% this week</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-purple-600 mb-1">{analytics.collaborators}</div>
                      <div className="text-sm text-gray-600">Active Collaborators</div>
                      <div className="text-xs text-gray-500 mt-1">Sarah, James, Lisa</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Target className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-orange-600 mb-1">{analytics.completion_rate}%</div>
                      <div className="text-sm text-gray-600">Completion Rate</div>
                      <div className="text-xs text-green-600 mt-1">↗ +5% this week</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Comment Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Resolved Comments</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                            </div>
                            <span className="text-sm font-medium">9/12</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">High Priority</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                            </div>
                            <span className="text-sm font-medium">3/12</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">With Reactions</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: "83%" }}></div>
                            </div>
                            <span className="text-sm font-medium">10/12</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Collaboration Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg Review Time</span>
                          <span className="text-sm font-medium">{analytics.avg_review_time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Response Rate</span>
                          <span className="text-sm font-medium">95%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Activity</span>
                          <span className="text-sm font-medium">{analytics.last_activity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Emoji Reactions</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm">🎉</span>
                            <span className="text-sm">👍</span>
                            <span className="text-sm">🚀</span>
                            <span className="text-sm">❤️</span>
                            <span className="text-xs text-gray-500">+6 more</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Frame.io v4 Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Frame.io v4 Features in Use</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Emoji Reactions</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Priority Comments</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Visual Annotations</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Task Management</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="h-full m-0 p-6 overflow-y-auto bg-gray-50">
              <div className="max-w-4xl space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Project Details</h3>
                  <p className="text-gray-600">Complete project information and Frame.io integration details</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Project ID</label>
                        <p className="text-sm text-gray-900 font-mono">{project.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Created Date</label>
                        <p className="text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Updated</label>
                        <p className="text-sm text-gray-900">{new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Assigned Editor</label>
                        <p className="text-sm text-gray-900">{project.assignedEditor || "Not assigned"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Revisions</label>
                        <p className="text-sm text-gray-900">
                          {project.revisions} / {project.maxRevisions}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Progress</label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Frame.io v4 Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <ExternalLink className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Frame.io Project</p>
                            <p className="text-xs text-gray-500 font-mono">
                              {project.frameioProjectId ? `ID: ${project.frameioProjectId}` : "Not connected"}
                            </p>
                          </div>
                        </div>
                        {project.frameioProjectId && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://app.frame.io/projects/${project.frameioProjectId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open in Frame.io
                            </a>
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <FileVideo className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">{frameioAssets.length}</p>
                          <p className="text-xs text-blue-500">Assets</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">{frameioComments.length}</p>
                          <p className="text-xs text-green-500">Comments</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <CheckCircle2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-600">
                            {frameioComments.filter((c) => !c.resolved).length}
                          </p>
                          <p className="text-xs text-purple-500">Unresolved</p>
                        </div>
                      </div>

                      {/* Frame.io v4 Features List */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Active Frame.io v4 Features</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Emoji Reactions</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Priority Comments</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Visual Annotations</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Task Management</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Categories & Tags</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Real-time Analytics</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Project Created</p>
                          <p className="text-xs text-gray-500">{new Date(project.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Frame.io Integration Added</p>
                          <p className="text-xs text-gray-500">Frame.io v4 features enabled</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Currently in Review</p>
                          <p className="text-xs text-gray-500">Awaiting client feedback via Frame.io</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-xs text-gray-500">{new Date(project.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {project.completedAt && (
                        <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-3 h-3 bg-green-600 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Project Completed</p>
                            <p className="text-xs text-gray-500">{new Date(project.completedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Project Tags */}
                {project.tags && project.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
