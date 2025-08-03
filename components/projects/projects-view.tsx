"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Play, MessageSquare, Calendar, User, Clock, Send, Plus, Filter, Search } from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"
import { demoProjects, demoComments } from "../../lib/demo-data"
import { VideoPlayerWithComments } from "../video/video-player-with-comments"

export function ProjectsView() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [commentType, setCommentType] = useState<"general" | "revision">("general")
  const [timeframe, setTimeframe] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadProjects()
  }, [user])

  useEffect(() => {
    if (selectedProject) {
      loadComments(selectedProject.id)
    }
  }, [selectedProject])

  const loadProjects = async () => {
    try {
      setLoading(true)
      // Filter projects by user
      const userProjects = demoProjects.filter((p) => p.clientId === user?.id)
      setProjects(userProjects)
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0])
      }
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (projectId: string) => {
    try {
      const projectComments = demoComments.filter((c) => c.projectId === projectId)
      setComments(projectComments)
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedProject || !user) return

    const newCommentObj = {
      id: `comment-${Date.now()}`,
      projectId: selectedProject.id,
      userId: user.id,
      content: newComment,
      type: commentType,
      priority: "medium",
      timeframe: commentType === "revision" ? timeframe : undefined,
      timestamp: 0,
      status: "unresolved",
      createdAt: new Date().toISOString(),
      replies: [],
    }

    setComments((prev) => [...prev, newCommentObj])
    setNewComment("")
    setTimeframe("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-slate-800 rounded"></div>
            <div className="lg:col-span-2 h-96 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage your video editing projects</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Your Projects ({filteredProjects.length})</h2>
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedProject?.id === project.id
                  ? "bg-purple-900/30 border-purple-600"
                  : "bg-slate-800 border-slate-700 hover:bg-slate-700"
              }`}
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
                <CardDescription className="text-slate-400">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    <span className="text-sm text-purple-400 font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center text-xs text-slate-400 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "No due date"}
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      Assigned
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Details */}
        {selectedProject && (
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl">{selectedProject.name}</CardTitle>
                    <CardDescription className="text-slate-400 mt-2">{selectedProject.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedProject.status)}>{selectedProject.status}</Badge>
                    <Badge className={getPriorityColor(selectedProject.priority)}>{selectedProject.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="video" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger
                      value="video"
                      className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger
                      value="comments"
                      className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Comments ({comments.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Details
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="mt-6">
                    <VideoPlayerWithComments
                      project={selectedProject}
                      comments={comments}
                      onAddComment={(comment) => setComments((prev) => [...prev, comment])}
                    />
                  </TabsContent>

                  <TabsContent value="comments" className="mt-6 space-y-4">
                    {/* Add Comment Form */}
                    <Card className="bg-slate-900 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Add Comment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-300">Comment Type</Label>
                            <Select
                              value={commentType}
                              onValueChange={(value: "general" | "revision") => setCommentType(value)}
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="general">General Comment</SelectItem>
                                <SelectItem value="revision">Revision Request</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {commentType === "revision" && (
                            <div>
                              <Label className="text-slate-300">Timeframe</Label>
                              <Select value={timeframe} onValueChange={setTimeframe}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                  <SelectValue placeholder="Select timeframe" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="1 day">1 day</SelectItem>
                                  <SelectItem value="2 days">2 days</SelectItem>
                                  <SelectItem value="3 days">3 days</SelectItem>
                                  <SelectItem value="1 week">1 week</SelectItem>
                                  <SelectItem value="2 weeks">2 weeks</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-slate-300">Comment</Label>
                          <Textarea
                            placeholder={
                              commentType === "revision"
                                ? "Describe the changes you'd like to see..."
                                : "Share your thoughts..."
                            }
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                            rows={3}
                          />
                        </div>
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Add Comment
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <Card key={comment.id} className="bg-slate-900 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-600 text-white">
                                  {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium text-white">{user?.name}</span>
                                  <Badge
                                    className={
                                      comment.type === "revision"
                                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                    }
                                  >
                                    {comment.type}
                                  </Badge>
                                  {comment.timeframe && (
                                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                      {comment.timeframe}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-slate-300">{comment.content}</p>
                                <p className="text-xs text-slate-500 mt-2">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {comments.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <MessageSquare className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                          <p>No comments yet</p>
                          <p className="text-sm">Be the first to add feedback!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-slate-900 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white">Project Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-slate-400">Status</Label>
                            <p className="text-white">{selectedProject.status}</p>
                          </div>
                          <div>
                            <Label className="text-slate-400">Priority</Label>
                            <p className="text-white">{selectedProject.priority}</p>
                          </div>
                          <div>
                            <Label className="text-slate-400">Progress</Label>
                            <div className="flex items-center space-x-2">
                              <Progress value={selectedProject.progress} className="flex-1" />
                              <span className="text-purple-400 font-medium">{selectedProject.progress}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-slate-400">Created</Label>
                            <p className="text-white">{new Date(selectedProject.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-slate-400">Last Updated</Label>
                            <p className="text-white">{new Date(selectedProject.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-slate-400">Due Date</Label>
                            <p className="text-white">
                              {selectedProject.dueDate
                                ? new Date(selectedProject.dueDate).toLocaleDateString()
                                : "No due date set"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
