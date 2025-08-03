"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Share2,
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { frameioService } from "../../lib/frameio"

interface FrameIOEmbedProps {
  assetId: string
  projectId?: string
  autoplay?: boolean
  showControls?: boolean
  showComments?: boolean
  className?: string
}

interface VideoComment {
  id: string
  text: string
  timestamp: number
  author: {
    name: string
    avatar?: string
  }
  created_at: string
  resolved?: boolean
}

export function FrameIOEmbed({
  assetId,
  projectId,
  autoplay = false,
  showControls = true,
  showComments = true,
  className = "",
}: FrameIOEmbedProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [embedUrl, setEmbedUrl] = useState<string>("")
  const [asset, setAsset] = useState<any>(null)
  const [comments, setComments] = useState<VideoComment[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showCommentsPanel, setShowCommentsPanel] = useState(showComments)

  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    loadAssetData()
  }, [assetId])

  const loadAssetData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load asset details
      const assetData = await frameioService.getAsset(assetId)
      setAsset(assetData)

      // Get embed URL
      const url = await frameioService.getEmbedUrl(assetId)
      setEmbedUrl(url)

      // Load comments if enabled
      if (showComments) {
        const commentsData = await frameioService.getComments(assetId)
        // Ensure comments have proper structure
        const normalizedComments = commentsData.map((comment: any) => ({
          id: comment.id || Math.random().toString(),
          text: comment.text || comment.message || "No comment text",
          timestamp: comment.timestamp || 0,
          author: {
            name: comment.author?.name || comment.user?.name || "Unknown User",
            avatar: comment.author?.avatar || comment.user?.avatar || undefined,
          },
          created_at: comment.created_at || comment.createdAt || new Date().toISOString(),
          resolved: comment.resolved || false,
        }))
        setComments(normalizedComments as VideoComment[])
      }

      console.log(`📹 Loaded Frame.io asset: ${assetData.name}`)
    } catch (error) {
      console.error("Error loading Frame.io asset:", error)
      setError("Failed to load video. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownload = async () => {
    try {
      const downloadUrl = await frameioService.getDownloadUrl(assetId)
      window.open(downloadUrl, "_blank")
    } catch (error) {
      console.error("Error getting download URL:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share && embedUrl) {
      try {
        await navigator.share({
          title: asset?.name || "Video",
          url: embedUrl,
        })
      } catch (error) {
        // Fallback to clipboard
        if (navigator.clipboard && embedUrl) {
          navigator.clipboard.writeText(embedUrl)
        }
      }
    } else if (embedUrl && navigator.clipboard) {
      navigator.clipboard.writeText(embedUrl)
    }
  }

  const jumpToComment = (timestamp: number) => {
    handleSeek(timestamp)
  }

  if (loading) {
    return (
      <Card className={`bg-slate-800 border-slate-700 ${className}`}>
        <CardContent className="p-0">
          <div className="aspect-video bg-slate-900 rounded-t-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto bg-slate-700" />
              <Skeleton className="h-4 w-32 mx-auto bg-slate-700" />
            </div>
          </div>
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4 bg-slate-700" />
            <Skeleton className="h-4 w-1/2 bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`bg-slate-800 border-slate-700 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-white">Failed to Load Video</h3>
              <p className="text-slate-400 mt-2">{error}</p>
            </div>
            <Button
              onClick={loadAssetData}
              variant="outline"
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`grid grid-cols-1 ${showCommentsPanel ? "lg:grid-cols-3" : ""} gap-6 ${className}`}>
      {/* Video Player */}
      <div className={showCommentsPanel ? "lg:col-span-2" : ""}>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
              {frameioService.isUsingMockData() ? (
                // Mock video player for development
                <div className="w-full h-full bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center relative">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium text-white">{asset?.name || "Video Preview"}</h3>
                      <p className="text-slate-300">Mock Frame.io Player</p>
                    </div>
                  </div>

                  {/* Mock video overlay */}
                  <div className="absolute inset-0 bg-black/20">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover opacity-50"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      poster="/placeholder.svg?height=400&width=600&text=Video+Thumbnail"
                    >
                      <source src="/placeholder-video.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              ) : (
                // Real Frame.io embed
                <iframe
                  ref={iframeRef}
                  src={`${embedUrl}?autoplay=${autoplay}&controls=${showControls}`}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={asset?.name || "Frame.io Video"}
                />
              )}

              {/* Custom Controls Overlay (for mock player) */}
              {frameioService.isUsingMockData() && showControls && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1 space-y-1">
                      <div className="w-full bg-white/20 rounded-full h-1">
                        <div
                          className="bg-purple-500 h-1 rounded-full transition-all"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-white/80">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>

                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">{asset?.name || "Untitled Video"}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {asset?.duration
                        ? `${Math.floor(asset.duration / 60)}:${Math.floor(asset.duration % 60)
                            .toString()
                            .padStart(2, "0")}`
                        : "0:00"}
                    </span>
                    {asset?.resolution && <span>{asset.resolution}</span>}
                    {asset?.fps && <span>{asset.fps}fps</span>}
                    {asset?.status && (
                      <Badge
                        variant={
                          asset.status === "ready"
                            ? "default"
                            : asset.status === "processing"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          asset.status === "ready"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : asset.status === "processing"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }
                      >
                        {asset.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {showComments && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 lg:hidden"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments ({comments.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Panel */}
      {showCommentsPanel && (
        <div className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments ({comments.length})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 lg:hidden bg-transparent"
                  onClick={() => setShowCommentsPanel(false)}
                >
                  Hide
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.author?.avatar ? (
                          <img
                            src={comment.author.avatar || "/placeholder.svg"}
                            alt={comment.author?.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              target.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <User className={`h-4 w-4 text-white ${comment.author?.avatar ? "hidden" : ""}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">
                            {comment.author?.name || "Unknown User"}
                          </span>
                          <button
                            onClick={() => jumpToComment(comment.timestamp)}
                            className="text-xs text-purple-400 hover:text-purple-300 font-mono"
                          >
                            {formatTime(comment.timestamp)}
                          </button>
                          {comment.resolved && <CheckCircle className="h-3 w-3 text-green-400" />}
                        </div>
                        <p className="text-sm text-slate-300">{comment.text}</p>
                        <p className="text-xs text-slate-500">
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No comments yet</p>
                    <p className="text-sm text-slate-500 mt-1">Be the first to leave feedback</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Also export as FrameioEmbed for backward compatibility
export { FrameIOEmbed as FrameioEmbed }
