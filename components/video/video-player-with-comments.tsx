"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Pause, Volume2, VolumeX, MessageSquare, Send, Clock } from "lucide-react"
import type { Project, VideoComment } from "../../types"

interface VideoPlayerWithCommentsProps {
  project: Project
  comments: VideoComment[]
  onAddComment: (comment: VideoComment) => void
}

export function VideoPlayerWithComments({ project, comments, onAddComment }: VideoPlayerWithCommentsProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentTimestamp, setCommentTimestamp] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("ended", () => setIsPlaying(false))

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("ended", () => setIsPlaying(false))
    }
  }, [])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
        setIsPlaying(false)
      } else {
        await video.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Video play error:", error)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration

    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: VideoComment = {
      id: `comment-${Date.now()}`,
      projectId: project.id,
      videoId: project.frameioAssetId || "default",
      userId: "current-user",
      userName: "You",
      userRole: "client",
      userAvatar: "/placeholder.svg?height=32&width=32&text=U",
      content: newComment,
      startTime: commentTimestamp,
      timestamp: commentTimestamp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolved: false,
      replies: [],
      type: "general",
      priority: "medium",
    }

    onAddComment(comment)
    setNewComment("")
    setShowCommentForm(false)
  }

  const jumpToComment = (timestamp: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = timestamp
    setCurrentTime(timestamp)
  }

  const addCommentAtCurrentTime = () => {
    setCommentTimestamp(currentTime)
    setShowCommentForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} src={project.videoUrl} className="w-full aspect-video" poster={project.thumbnailUrl} />

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <div className="flex-1 flex items-center space-x-2">
              <span className="text-white text-sm">{formatTime(currentTime)}</span>
              <div className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer" onClick={handleSeek}>
                <div
                  className="h-full bg-purple-600 rounded-full relative"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={addCommentAtCurrentTime}
              className="text-white hover:bg-white/20"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </div>
        </div>

        {/* Comment Markers */}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="absolute bottom-16 w-3 h-3 bg-yellow-400 rounded-full cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: `${duration ? (comment.timestamp / duration) * 100 : 0}%`,
              transform: "translateX(-50%)",
            }}
            onClick={() => jumpToComment(comment.timestamp)}
            title={`${comment.userName}: ${comment.content}`}
          />
        ))}
      </div>

      {/* Comments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Comment Form */}
        {showCommentForm && (
          <Card className="bg-slate-900 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Add Comment at {formatTime(commentTimestamp)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add your feedback or comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCommentForm(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Comments ({comments.length})</h3>
          {comments.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <Card key={comment.id} className="bg-slate-900 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          {comment.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-white">{comment.userName}</span>
                          <Badge
                            className={
                              comment.type === "revision_request"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                : comment.type === "approval"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            }
                          >
                            {comment.type.replace("_", " ")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => jumpToComment(comment.timestamp)}
                            className="text-purple-400 hover:text-purple-300 p-0 h-auto"
                          >
                            {formatTime(comment.timestamp)}
                          </Button>
                        </div>
                        <p className="text-slate-300 text-sm">{comment.content}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <p>No comments yet</p>
              <p className="text-sm">Click "Add Comment" while watching to leave feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
