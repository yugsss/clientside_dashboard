"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Send,
  Reply,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Tag,
  Smile,
  Edit,
  Trash2,
  Filter,
} from "lucide-react"
import type { FrameioComment } from "../../lib/frameio"
import type { User } from "../../types"

interface CommentsPanelProps {
  assetId: string
  comments: FrameioComment[]
  onAddComment: (
    content: string,
    timestamp: number,
    annotation?: any,
    priority?: string,
    category?: string,
    tags?: string[],
  ) => void
  onUpdateComment: (
    commentId: string,
    updates: { text?: string; resolved?: boolean; priority?: string; category?: string; tags?: string[] },
  ) => void
  onDeleteComment: (commentId: string) => void
  onReplyToComment: (commentId: string, text: string) => void
  onAddReaction?: (commentId: string, emoji: string) => void
  onRemoveReaction?: (commentId: string, emoji: string) => void
  currentTime: number
  currentUser?: User | null
}

export function CommentsPanel({
  assetId,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onReplyToComment,
  onAddReaction,
  onRemoveReaction,
  currentTime,
  currentUser,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [newCommentPriority, setNewCommentPriority] = useState("medium")
  const [newCommentCategory, setNewCommentCategory] = useState("")
  const [newCommentTags, setNewCommentTags] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [filter, setFilter] = useState("all")
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  const emojis = ["👍", "❤️", "🎉", "🚀", "💯", "👏", "🔥", "✨", "🎯", "💪", "🤔", "😍"]

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments])

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const tags = newCommentTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    onAddComment(newComment, currentTime, undefined, newCommentPriority, newCommentCategory, tags)

    setNewComment("")
    setNewCommentPriority("medium")
    setNewCommentCategory("")
    setNewCommentTags("")
  }

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return

    onReplyToComment(commentId, replyText)
    setReplyingTo(null)
    setReplyText("")
  }

  const handleEdit = (commentId: string) => {
    if (!editText.trim()) return

    onUpdateComment(commentId, { text: editText })
    setEditingComment(null)
    setEditText("")
  }

  const handleResolve = (commentId: string, resolved: boolean) => {
    onUpdateComment(commentId, { resolved })
  }

  const handleAddReaction = (commentId: string, emoji: string) => {
    onAddReaction?.(commentId, emoji)
    setShowEmojiPicker(null)
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      case "high":
        return <AlertCircle className="h-3 w-3 text-orange-500" />
      case "medium":
        return <Clock className="h-3 w-3 text-yellow-500" />
      case "low":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      default:
        return <Target className="h-3 w-3 text-gray-500" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (time?: number) => {
    if (time === undefined) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const filteredComments = comments.filter((comment) => {
    if (filter === "all") return true
    if (filter === "unresolved") return !comment.resolved
    if (filter === "high-priority") return comment.priority === "high" || comment.priority === "urgent"
    if (filter === "my-comments") return comment.author.id === currentUser?.id
    return true
  })

  const sortedComments = [...filteredComments].sort((a, b) => {
    // Sort by timestamp first, then by creation date
    if (a.timestamp !== b.timestamp) {
      return (a.timestamp || 0) - (b.timestamp || 0)
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comments ({comments.length})
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
              <SelectItem value="high-priority">High Priority</SelectItem>
              <SelectItem value="my-comments">My Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comment Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span>{comments.filter((c) => !c.resolved).length} unresolved</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>{comments.filter((c) => c.priority === "high" || c.priority === "urgent").length} high priority</span>
          </div>
        </div>
      </CardHeader>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet</p>
            <p className="text-sm text-gray-400">Add the first comment to start the conversation</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <Card
              key={comment.id}
              className={`${comment.resolved ? "opacity-75" : ""} ${
                comment.priority === "urgent" || comment.priority === "high" ? "border-l-4 border-l-red-400" : ""
              }`}
            >
              <CardContent className="p-4">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        {comment.timestamp !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(comment.timestamp)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {comment.priority && (
                      <Badge className={`text-xs ${getPriorityColor(comment.priority)}`}>
                        {getPriorityIcon(comment.priority)}
                        <span className="ml-1 capitalize">{comment.priority}</span>
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Comment Content */}
                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[60px]" />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleEdit(comment.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed">{comment.text}</p>

                    {/* Category and Tags */}
                    {(comment.category || (comment.tags && comment.tags.length > 0)) && (
                      <div className="flex items-center space-x-2">
                        {comment.category && (
                          <Badge variant="secondary" className="text-xs">
                            {comment.category}
                          </Badge>
                        )}
                        {comment.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Reactions */}
                    {comment.reactions && Object.keys(comment.reactions).length > 0 && (
                      <div className="flex items-center space-x-2">
                        {Object.entries(comment.reactions).map(([emoji, users]) => (
                          <Button
                            key={emoji}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs bg-transparent"
                            onClick={() => onRemoveReaction?.(comment.id, emoji)}
                          >
                            {emoji} {users.length}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                        >
                          <Smile className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker === comment.id && (
                      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleAddReaction(comment.id, emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Comment Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)} className="text-xs">
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        {comment.author.id === currentUser?.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingComment(comment.id)
                                setEditText(comment.text)
                              }}
                              className="text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteComment(comment.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        variant={comment.resolved ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleResolve(comment.id, !comment.resolved)}
                        className={`text-xs ${
                          comment.resolved ? "text-green-600 border-green-200" : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {comment.resolved ? "Resolved" : "Resolve"}
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleReply(comment.id)}>
                            <Send className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Add Comment Form */}
      <div className="border-t p-4 bg-gray-50">
        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment at current time..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />

          {/* Comment Options */}
          <div className="grid grid-cols-3 gap-2">
            <Select value={newCommentPriority} onValueChange={setNewCommentPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <input
              type="text"
              placeholder="Category"
              value={newCommentCategory}
              onChange={(e) => setNewCommentCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newCommentTags}
              onChange={(e) => setNewCommentTags(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Comment will be added at {formatTime(currentTime)}</div>
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
