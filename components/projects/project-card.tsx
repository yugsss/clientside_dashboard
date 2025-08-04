"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  MessageSquare,
  Eye,
  AlertCircle,
  CheckCircle2,
  Timer,
  Target,
  ExternalLink,
  FileVideo,
  TrendingUp,
} from "lucide-react"
import type { Project } from "../../types"

interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onChat: (project: Project) => void
}

export function ProjectCard({ project, onView, onChat }: ProjectCardProps) {
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

  const isFrameioProject = project.frameioProjectId && project.title.includes("Frame.io v4")

  return (
    <Card className={`h-full transition-all hover:shadow-lg ${isFrameioProject ? "ring-2 ring-purple-200" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2 flex items-center">
              {project.title}
              {isFrameioProject && <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">Frame.io v4</Badge>}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-3">
          <Badge className={getStatusColor(project.status)} variant="secondary">
            {project.status.replace("_", " ")}
          </Badge>
          <div className="flex items-center space-x-1">
            {getPriorityIcon(project.priority)}
            <Badge variant="outline" className="text-xs capitalize">
              {project.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg relative overflow-hidden">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl || "/placeholder.svg"}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileVideo className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Frame.io Badge Overlay */}
          {isFrameioProject && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-600 text-white text-xs">🎬 Frame.io v4</Badge>
            </div>
          )}

          {/* Progress Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1" />
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <div className="flex items-center justify-center mb-1">
              <Eye className="h-3 w-3 text-blue-600" />
            </div>
            <div className="text-sm font-semibold text-blue-600">
              {isFrameioProject ? "47" : Math.floor(Math.random() * 50) + 10}
            </div>
            <div className="text-xs text-blue-500">Views</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-sm font-semibold text-green-600">
              {isFrameioProject ? "12" : Math.floor(Math.random() * 20) + 5}
            </div>
            <div className="text-xs text-green-500">Comments</div>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-3 w-3 text-purple-600" />
            </div>
            <div className="text-sm font-semibold text-purple-600">{project.progress}%</div>
            <div className="text-xs text-purple-500">Complete</div>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Due:</span>
            </div>
            <span className="font-medium">
              {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "No deadline"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Duration:</span>
            </div>
            <span className="font-medium">
              {project.duration
                ? `${Math.floor(project.duration / 60)}:${(project.duration % 60).toString().padStart(2, "0")}`
                : "TBD"}
            </span>
          </div>
          {project.frameioProjectId && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <ExternalLink className="h-3 w-3" />
                <span>Frame.io:</span>
              </div>
              <span className="font-medium font-mono text-xs">{project.frameioProjectId.slice(-8)}</span>
            </div>
          )}
        </div>

        {/* Frame.io v4 Features Preview */}
        {isFrameioProject && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-xs font-medium text-purple-800 mb-2">Frame.io v4 Features Active:</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs bg-white">
                🎉 Reactions
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                🎯 Priority
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                📝 Annotations
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                📊 Analytics
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button onClick={() => onView(project)} className="flex-1" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Project
          </Button>
          <Button onClick={() => onChat(project)} variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>

        {/* Client Action for Review Status */}
        {project.status === "in_review" && project.canApprove && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-xs font-medium text-yellow-800 mb-2">Ready for Review</div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                Request Changes
              </Button>
              <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700">
                Approve
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
