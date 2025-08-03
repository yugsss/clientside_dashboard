"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, CheckCircle, Clock, Reply, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Comment } from "../../types"

interface CommentsPanelProps {
  comments: Comment[]
  onAddComment: (content: string, timestamp: number) => Promise<void>
  onResolveComment: (commentId: string) => Promise<void>
  currentTime: number
  className?: string
}

export function CommentsPanel({
  comments,
  onAddComment,
  onResolveComment,
  currentTime,
  className,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const timestamp = selectedTimestamp !== null ? selectedTimestamp : currentTime
      await onAddComment(newComment, timestamp)
      setNewComment("")
      setSelectedTimestamp(null)
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolveComment = async (commentId: string) => {
    try {
      await onResolveComment(commentId)
    } catch (error) {
      console.error("Failed to resolve comment:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const sortedComments = [...comments].sort((a, b) => a.timestamp - b.timestamp)
  const unresolvedComments = sortedComments.filter((c) => !c.resolved)
  const resolvedComments = sortedComments.filter((c) => c.resolved)

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments</span>
            <Badge variant="secondary">{comments.length}</Badge>
          </div>
          {unresolvedComments.length > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {unresolvedComments.length} unresolved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Add Comment Form */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Add Comment</span>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {selectedTimestamp !== null ? `At ${formatTime(selectedTimestamp)}` : `At ${formatTime(currentTime)}`}
              </span>
              {selectedTimestamp !== null && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTimestamp(null)}
                  className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              )}
            </div>
          </div>

          <Textarea
            placeholder="Add your feedback or question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmitComment()
              }
            }}
          />

          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedTimestamp(currentTime)}
              disabled={selectedTimestamp === currentTime}
            >
              Use Current Time ({formatTime(currentTime)})
            </Button>

            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Add Comment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No comments yet</p>
              <p className="text-gray-400 text-xs">Add the first comment to start the conversation</p>
            </div>
          ) : (
            <>
              {/* Unresolved Comments */}
              {unresolvedComments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Unresolved ({unresolvedComments.length})
                  </h4>
                  {unresolvedComments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onResolve={handleResolveComment}
                      onReply={setReplyingTo}
                      isReplying={replyingTo === comment.id}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                    />
                  ))}
                </div>
              )}

              {/* Resolved Comments */}
              {resolvedComments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Resolved ({resolvedComments.length})
                  </h4>
                  {resolvedComments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onResolve={handleResolveComment}
                      onReply={setReplyingTo}
                      isReplying={replyingTo === comment.id}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          <div ref={commentsEndRef} />
        </div>
      </CardContent>
    </Card>
  )
}

interface CommentItemProps {
  comment: Comment
  onResolve: (commentId: string) => Promise<void>
  onReply: (commentId: string | null) => void
  isReplying: boolean
  replyContent: string
  setReplyContent: (content: string) => void
}

function CommentItem({ comment, onResolve, onReply, isReplying, replyContent, setReplyContent }: CommentItemProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div
      className={`p-3 rounded-lg border ${
        comment.resolved ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.userAvatar || "/placeholder.svg"} />
          <AvatarFallback className="text-xs">{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
              <Badge variant="outline" className="text-xs">
                {formatTime(comment.timestamp)}
              </Badge>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">{formatTimestamp(comment.createdAt)}</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReply(comment.id)}>
                    <Reply className="h-3 w-3 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

          <div className="flex items-center space-x-2">
            {!comment.resolved && (
              <Button size="sm" variant="outline" onClick={() => onResolve(comment.id)} className="text-xs h-6">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReply(isReplying ? null : comment.id)}
              className="text-xs h-6"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex items-center space-x-2">
                <Button size="sm" className="text-xs h-6">
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onReply(null)} className="text-xs h-6">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={reply.userAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{reply.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-900">{reply.userName}</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-700">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
