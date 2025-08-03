"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Play, MessageSquare } from "lucide-react"
import type { Project } from "../../types"

interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onChat: (project: Project) => void
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

const getPriorityColor = (priority: Project["priority"]) => {
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "urgent":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function ProjectCard({ project, onView, onChat }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{project.title}</CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          </div>
          {project.thumbnailUrl && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={project.thumbnailUrl || "/placeholder.svg"}
                alt={project.title}
                className="w-16 h-12 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Priority */}
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
          <Badge variant="outline" className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
        </div>

        {/* Project Details */}
        <div className="space-y-2 text-sm text-gray-600">
          {project.duration && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Duration: {project.duration}</span>
            </div>
          )}

          {project.deadline && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}

          {project.assignedEditor && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Editor: {project.assignedEditor}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => onView(project)}>
              <Play className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => onChat(project)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>

          <div className="text-xs text-gray-500">Updated {new Date(project.updatedAt).toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
