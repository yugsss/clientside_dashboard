"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, User, Clock, Tag, MessageSquare, Download, Edit } from "lucide-react"
import { FrameIOEmbed } from "../video/frameio-embed"
import { CommentsPanel } from "../video/comments-panel"
import { useProjectsStore } from "../../stores/projects-store"
import { useAuthStore } from "../../stores/auth-store"
import type { Project } from "../../types"

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onChatOpen: () => void
}

export function ProjectDetail({ project, onBack, onChatOpen }: ProjectDetailProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState("video")

  const { user } = useAuthStore()
  const { videos, comments, fetchVideos, fetchComments, addComment, resolveComment, updateProjectStatus } =
    useProjectsStore()

  useEffect(() => {
    fetchVideos(project.id)
  }, [project.id, fetchVideos])

  useEffect(() => {
    if (videos.length > 0) {
      fetchComments(videos[0].id)
    }
  }, [videos, fetchComments])

  const handleAddComment = async (content: string, timestamp: number) => {
    if (videos.length > 0) {
      await addComment(videos[0].id, content, timestamp)
    }
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
      case "review":
        return "bg-yellow-100 text-yellow-800"
      case "revision":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canEditProject = user?.role === "admin" || (user?.role === "employee" && project.assignedEditor === user.id)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onChatOpen}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            {canEditProject && (
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Editor: {project.assignedEditor || "Unassigned"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Duration: {project.duration || "TBD"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
            <Badge variant="outline" className="capitalize">
              {project.priority} Priority
            </Badge>
          </div>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex items-center space-x-2 mt-4">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Status Actions for Clients */}
        {user?.role === "client" && project.status === "review" && (
          <div className="flex items-center space-x-2 mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Your video is ready for review</p>
              <p className="text-xs text-yellow-600">Please review the video and provide feedback or approve it</p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("revision")}>
                Request Changes
              </Button>
              <Button size="sm" onClick={() => handleStatusUpdate("completed")}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 py-2 border-b border-gray-200">
            <TabsList>
              <TabsTrigger value="video">Video & Comments</TabsTrigger>
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="files">Files & Assets</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="video" className="h-full m-0">
              {videos.length > 0 ? (
                <div className="h-full flex">
                  <div className="flex-1 p-6">
                    <FrameIOEmbed
                      video={videos[0]}
                      onTimeUpdate={setCurrentTime}
                      onAddComment={(timestamp) => {
                        // Switch to comments panel and focus on add comment
                        setActiveTab("video")
                      }}
                      className="h-full"
                    />
                  </div>
                  <div className="w-96 flex-shrink-0">
                    <CommentsPanel
                      comments={comments}
                      onAddComment={handleAddComment}
                      onResolveComment={resolveComment}
                      currentTime={currentTime}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Video in Progress</h3>
                    <p className="text-gray-600">Your video is being processed and will be available soon</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="h-full m-0 p-6 overflow-y-auto">
              <div className="max-w-4xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Project ID</label>
                        <p className="text-sm text-gray-900">{project.id}</p>
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
                        <label className="text-sm font-medium text-gray-700">Frame.io Project</label>
                        <p className="text-sm text-gray-900">{project.frameioProjectId || "Not linked"}</p>
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
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Project Created</p>
                          <p className="text-xs text-gray-500">{new Date(project.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-xs text-gray-500">{new Date(project.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="files" className="h-full m-0 p-6 overflow-y-auto">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Files & Assets</h3>
                <p className="text-gray-600">Project files and assets will be available here</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
