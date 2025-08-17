"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, MessageSquare, Star, Download, ExternalLink } from "lucide-react"

interface Project {
  id: string
  title: string
  status: string
  frameio_project_id?: string
  final_deliverable_url?: string
}

interface ApprovalSystemProps {
  project: Project
  onApprove: (feedback?: string) => Promise<void>
  onReject: (reason: string) => Promise<void>
  onRequestRevision: () => void
  canApprove: boolean
  canReject: boolean
  canRequestRevision: boolean
}

export default function ApprovalSystem({
  project,
  onApprove,
  onReject,
  onRequestRevision,
  canApprove,
  canReject,
  canRequestRevision,
}: ApprovalSystemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onApprove(feedback.trim() || undefined)
      setFeedback("")
      setShowApprovalForm(false)
    } catch (error) {
      console.error("Failed to approve project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectionReason.trim()) return

    setIsSubmitting(true)
    try {
      await onReject(rejectionReason.trim())
      setRejectionReason("")
      setShowRejectionForm(false)
    } catch (error) {
      console.error("Failed to reject project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReadyForApproval = project.status === "client_review"

  return (
    <div className="space-y-6">
      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Project Approval
          </CardTitle>
          <CardDescription>Review and approve your completed project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{project.title}</p>
              <p className="text-sm text-gray-600">
                Status:{" "}
                <Badge
                  className={
                    project.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : project.status === "client_review"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {project.status.replace("_", " ")}
                </Badge>
              </p>
            </div>
            {project.frameio_project_id && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://app.frame.io/projects/${project.frameio_project_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in Frame.io
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ready for Approval */}
      {isReadyForApproval && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-700">🎉 Your Project is Ready!</CardTitle>
            <CardDescription>
              Your video has been completed and is ready for your final review and approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Please review the video using Frame.io's commenting features. You can approve the project, request
                  revisions, or provide additional feedback.
                </AlertDescription>
              </Alert>

              {/* Final Deliverable */}
              {project.final_deliverable_url && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">Final Deliverable Ready</p>
                      <p className="text-sm text-blue-700">High-quality video file available for download</p>
                    </div>
                    <Button size="sm" asChild>
                      <a href={project.final_deliverable_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canApprove && (
                  <Button onClick={() => setShowApprovalForm(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Project
                  </Button>
                )}
                {canRequestRevision && (
                  <Button onClick={onRequestRevision} variant="outline" className="flex-1 bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Revisions
                  </Button>
                )}
                {canReject && (
                  <Button onClick={() => setShowRejectionForm(true)} variant="outline" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Project
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Ready for Approval */}
      {!isReadyForApproval && (
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            Your project is currently {project.status.replace("_", " ")}. You'll be able to approve it once it's ready
            for client review.
          </AlertDescription>
        </Alert>
      )}

      {/* Approval Form */}
      {showApprovalForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Approve Project</CardTitle>
            <CardDescription>Confirm your approval and optionally provide feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts about the final result..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {isSubmitting ? "Approving..." : "Confirm Approval"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowApprovalForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rejection Form */}
      {showRejectionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-700">Reject Project</CardTitle>
            <CardDescription>Please provide a reason for rejecting this project</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please explain why you're rejecting this project..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Rejecting a project will require starting over. Consider requesting revisions instead if the issues
                  can be addressed.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-3">
                <Button type="submit" disabled={isSubmitting || !rejectionReason.trim()} variant="destructive">
                  {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRejectionForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
