"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"

interface Comment {
  id: string
  content: string
  timestamp?: number
  type: "general" | "revision" | "qc_feedback"
  priority: "low" | "medium" | "high" | "urgent"
  resolved: boolean
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
  }
  created_at: string
  replies?: Comment[]
}

interface VideoCommentsProps {
  projectId: string
  assetId: string
  currentTime: number
  onSeekTo: (time: number) => void
  userRole: "client" | "employee" | "admin" | "qc"
  canComment: boolean
}

export function VideoComments({ projectId, assetId, currentTime, onSeekTo, userRole, canComment }: VideoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [commentType, setCommentType] = useState<"general" | "revision" | "qc_feedback">("general")
  const [commentPriority, setCommentPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
  }, [projectId, assetId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments?assetId=${assetId}`)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !canComment) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          content: newComment,
          timestamp: Math.floor(currentTime),
          type: commentType,
          priority: commentPriority,
          assetId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setNewComment("")
        fetchComments()
        toast({
          title: "Success",
          description: "Comment added successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolveComment = async (commentId: string, resolved: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ resolved }),
      })

      const data = await response.json()
      if (data.success) {
        fetchComments()
        toast({
          title: "Success",
          description: resolved ? "Comment marked as resolved" : "Comment reopened",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600/20 text-red-300 border-red-600/30"
      case "high":
        return "bg-orange-600/20 text-orange-300 border-orange-600/30"
      case "medium":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-600/30"
      case "low":
        return "bg-green-600/20 text-green-300 border-green-600/30"
      default:
        return "bg-slate-600/20 text-slate-300 border-slate-600/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "revision":
        return <AlertTriangle className="h-4 w-4" />
      case "qc_feedback":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const canResolve = userRole === "admin" || userRole === "employee" || userRole === "qc"

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-slate-400">Loading comments...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Video Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        {canComment && (
          <div className="space-y-3 p-4 border border-slate-700 rounded-lg">
            <div className="flex space-x-3">
              <Select value={commentType} onValueChange={(value: any) => setCommentType(value)}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="revision">Revision Request</SelectItem>
                  {userRole === "qc" && <SelectItem value="qc_feedback">QC Feedback</SelectItem>}
                </SelectContent>
              </Select>

              <Select value={commentPriority} onValueChange={(value: any) => setCommentPriority(value)}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="border-slate-600 text-slate-400">
                <Clock className="mr-1 h-3 w-3" />
                {formatTime(currentTime)}
              </Badge>
            </div>

            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment at the current timestamp..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />

            <Button onClick={handleSubmitComment} disabled={submitting || !newComment.trim()}>
              {submitting ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No comments yet</p>
              <p className="text-slate-500 text-sm">
                Double-click on the video or use the comment button to add feedback
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 border rounded-lg ${
                  comment.resolved ? "border-green-600/30 bg-green-600/5" : "border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {comment.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{comment.user.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{comment.user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(comment.priority)}>
                      {getTypeIcon(comment.type)}
                      <span className="ml-1 capitalize">{comment.priority}</span>
                    </Badge>
                    {comment.timestamp !== undefined && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSeekTo(comment.timestamp!)}
                        className="text-blue-400 hover:bg-blue-600/20"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(comment.timestamp)}
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-slate-300 mb-3">{comment.content}</p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
                  <div className="flex space-x-2">
                    {canResolve && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolveComment(comment.id, !comment.resolved)}
                        className={
                          comment.resolved
                            ? "text-orange-400 hover:bg-orange-600/20"
                            : "text-green-400 hover:bg-green-600/20"
                        }
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {comment.resolved ? "Reopen" : "Resolve"}
                      </Button>
                    )}
                    {comment.resolved && (
                      <Badge className="bg-green-600/20 text-green-300 border-green-600/30">Resolved</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
