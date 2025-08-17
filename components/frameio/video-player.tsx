"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, MessageSquare, Clock } from "lucide-react"
import { VideoComments } from "./video-comments"

interface VideoPlayerProps {
  projectId: string
  assetId: string
  videoUrl: string
  title: string
  duration?: number
  canComment?: boolean
  userRole?: "client" | "employee" | "admin" | "qc"
}

export function VideoPlayer({
  projectId,
  assetId,
  videoUrl,
  title,
  duration = 0,
  canComment = true,
  userRole = "client",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [videoDuration, setVideoDuration] = useState(duration)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setVideoDuration(video.duration)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = value[0]
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      video.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAddComment = (timestamp: number) => {
    // This will be handled by the VideoComments component
    setShowComments(true)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
              {formatTime(videoDuration)}
            </Badge>
            {canComment && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowComments(!showComments)}
                className="border-slate-600 text-slate-300 bg-transparent"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Comments
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto max-h-96"
              onClick={togglePlay}
              onDoubleClick={() => handleAddComment(currentTime)}
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="flex items-center space-x-3">
                  <span className="text-white text-sm min-w-[40px]">{formatTime(currentTime)}</span>
                  <Slider
                    value={[currentTime]}
                    max={videoDuration}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="flex-1"
                  />
                  <span className="text-white text-sm min-w-[40px]">{formatTime(videoDuration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button size="sm" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {canComment && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddComment(currentTime)}
                        className="text-white hover:bg-white/20"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Add Comment
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Panel */}
      {showComments && (
        <VideoComments
          projectId={projectId}
          assetId={assetId}
          currentTime={currentTime}
          onSeekTo={(time) => handleSeek([time])}
          userRole={userRole}
          canComment={canComment}
        />
      )}
    </div>
  )
}
