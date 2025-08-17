"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Download } from "lucide-react"

interface FrameioAsset {
  id: string
  name: string
  url?: string
  thumbnail_url?: string
  duration?: number
  filetype?: string
  processing_status: "queued" | "processing" | "completed" | "failed"
  processing_progress?: number
  approval_status?: "pending" | "approved" | "rejected"
  analytics?: {
    view_count: number
    comment_count: number
    download_count: number
  }
}

interface FrameIOEmbedProps {
  asset: FrameioAsset
  onTimeUpdate?: (time: number) => void
  onAddComment?: (timestamp: number) => void
  className?: string
}

export default function FrameIOEmbed({ asset, onTimeUpdate, onAddComment, className }: FrameIOEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const time = video.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [onTimeUpdate])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = percent * duration
    video.currentTime = time
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = Number.parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (e.detail === 2) {
      // Double click to add comment
      const time = videoRef.current?.currentTime || 0
      onAddComment?.(time)
    } else {
      // Single click to play/pause
      togglePlay()
    }
  }

  if (asset.processing_status !== "completed") {
    return (
      <Card className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Video Processing</h3>
          <p className="text-gray-400 mb-4">
            {asset.processing_status === "queued" && "Video is queued for processing"}
            {asset.processing_status === "processing" && `Processing: ${asset.processing_progress || 0}%`}
            {asset.processing_status === "failed" && "Processing failed"}
          </p>
          {asset.processing_status === "processing" && (
            <div className="w-48 bg-gray-700 rounded-full h-2 mx-auto">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${asset.processing_progress || 0}%` }}
              />
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Frame.io Badge */}
      <div className="absolute top-4 right-4 z-20">
        <Badge className="bg-purple-600 text-white">Frame.io v4</Badge>
      </div>

      {/* Approval Status */}
      {asset.approval_status && (
        <div className="absolute top-4 left-4 z-20">
          <Badge
            className={
              asset.approval_status === "approved"
                ? "bg-green-600 text-white"
                : asset.approval_status === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-yellow-600 text-white"
            }
          >
            {asset.approval_status}
          </Badge>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        src={asset.url || "/placeholder-video.mp4"}
        poster={asset.thumbnail_url}
        onClick={handleVideoClick}
        onDoubleClick={(e) => e.preventDefault()}
      />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-2 bg-white/20 rounded-full cursor-pointer" onClick={handleSeek}>
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => onAddComment?.(currentTime)}
              >
                Add Comment
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Timestamp Markers */}
      <div className="absolute bottom-16 left-4 right-4 pointer-events-none">
        <div className="relative h-1">{/* Comment markers would be positioned here based on timestamps */}</div>
      </div>
    </div>
  )
}
