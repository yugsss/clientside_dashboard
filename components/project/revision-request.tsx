"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, Clock, CheckCircle2, XCircle, MessageSquare, Timer } from "lucide-react"

interface Project {
  id: string
  title: string
  status: string
  revisions: number
  max_revisions: number
  client_plan: string
}

interface Revision {
  id: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  category?: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  timestamp?: number
  created_at: string
  requested_by: {
    id: string
    first_name: string
    last_name: string
  }
  resolved_by?: {
    id: string
    first_name: string
    last_name: string
  }
  resolved_at?: string
}

interface RevisionRequestProps {
  project: Project
  revisions: Revision[]
  onRevisionRequest: (data: {
    description: string
    priority: string
    category?: string
    timestamp?: number
  }) => Promise<void>
  currentTime?: number
}

export default function RevisionRequest({ project, revisions, onRevisionRequest, currentTime }: RevisionRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<string>("medium")
  const [category, setCategory] = useState<string>("")
  const [timestamp, setTimestamp] = useState<number | undefined>(currentTime)
  const [showForm, setShowForm] = useState(false)

  const planLimits = {
    basic: 1,
    "monthly-pass": 2,
    premium: 3,
    ultimate: -1, // unlimited
  }

  const completedRevisions = revisions.filter((r) => r.status === "completed").length
  const maxRevisions = planLimits[project.client_plan.toLowerCase() as keyof typeof planLimits] || 1
  const canRequestRevision = maxRevisions === -1 || completedRevisions < maxRevisions
  const pendingRevisions = revisions.filter((r) => r.status === "pending" || r.status === "in_progress")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsSubmitting(true)
    try {
      await onRevisionRequest({
        description: description.trim(),
        priority,
        category: category || undefined,
        timestamp,
      })
      setDescription("")
      setCategory("")
      setTimestamp(currentTime)
      setPriority("medium")
      setShowForm(false)
    } catch (error) {
      console.error("Failed to submit revision request:", error)
    } finally {
      setIsSubmitting(false)
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
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Plan Limits Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Revision Requests
          </CardTitle>
          <CardDescription>
            Request changes to your project. Your {project.client_plan} plan includes{" "}
            {maxRevisions === -1 ? "unlimited" : maxRevisions} revision{maxRevisions === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <span className="font-medium">Revisions Used:</span>
                <span className="ml-2">
                  {completedRevisions} / {maxRevisions === -1 ? "∞" : maxRevisions}
                </span>
              </div>
              {pendingRevisions.length > 0 && <Badge variant="secondary">{pendingRevisions.length} pending</Badge>}
            </div>
            <div className="flex items-center space-x-2">
              {canRequestRevision ? (
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Limit Reached</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      {canRequestRevision && project.status === "client_review" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Revision</CardTitle>
            <CardDescription>Describe the changes you'd like to see in your project</CardDescription>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Revision
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="description">Revision Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the changes you'd like to see..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="video">Video Quality</SelectItem>
                        <SelectItem value="editing">Editing/Cuts</SelectItem>
                        <SelectItem value="graphics">Graphics/Text</SelectItem>
                        <SelectItem value="color">Color/Grading</SelectItem>
                        <SelectItem value="timing">Timing/Pacing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {currentTime !== undefined && (
                  <div>
                    <Label htmlFor="timestamp">Video Timestamp (Optional)</Label>
                    <Input
                      id="timestamp"
                      type="number"
                      step="0.1"
                      value={timestamp || ""}
                      onChange={(e) => setTimestamp(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      placeholder="Timestamp in seconds"
                    />
                    {timestamp && <p className="text-sm text-gray-500 mt-1">At {formatTimestamp(timestamp)}</p>}
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Button type="submit" disabled={isSubmitting || !description.trim()}>
                    {isSubmitting ? "Submitting..." : "Submit Revision Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revision Limit Warning */}
      {!canRequestRevision && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have reached your revision limit for the {project.client_plan} plan. Consider upgrading to request
            additional revisions.
          </AlertDescription>
        </Alert>
      )}

      {/* Project Status Warning */}
      {project.status !== "client_review" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Revision requests can only be made when the project is ready for client review.
          </AlertDescription>
        </Alert>
      )}

      {/* Revision History */}
      {revisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revision History</CardTitle>
            <CardDescription>Track all revision requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revisions.map((revision) => (
                <div key={revision.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(revision.status)}
                      <Badge
                        className={
                          revision.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : revision.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : revision.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {revision.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(revision.priority)}
                      <Badge variant="outline" className="capitalize">
                        {revision.priority}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-900 mb-3">{revision.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>
                        Requested by {revision.requested_by.first_name} {revision.requested_by.last_name}
                      </span>
                      <span>{new Date(revision.created_at).toLocaleDateString()}</span>
                      {revision.category && <Badge variant="outline">{revision.category}</Badge>}
                      {revision.timestamp && <span>At {formatTimestamp(revision.timestamp)}</span>}
                    </div>
                    {revision.resolved_by && revision.resolved_at && (
                      <span>
                        Resolved by {revision.resolved_by.first_name} {revision.resolved_by.last_name} on{" "}
                        {new Date(revision.resolved_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
