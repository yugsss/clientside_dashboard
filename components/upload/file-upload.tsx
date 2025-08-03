"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, type File, X, CheckCircle, AlertCircle, Video, ImageIcon, FileText, Loader2 } from "lucide-react"

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  acceptedTypes?: string[]
  maxSize?: number
  maxFiles?: number
  projectId?: string
  className?: string
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
  preview?: string
}

export function FileUpload({
  onUpload,
  acceptedTypes = ["video/*", "image/*"],
  maxSize = 500 * 1024 * 1024, // 500MB
  maxFiles = 10,
  projectId,
  className,
}: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.warn("Some files were rejected:", rejectedFiles)
    }

    // Create upload file objects
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}`,
      progress: 0,
      status: "pending",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }))

    setUploadFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce(
      (acc, type) => {
        acc[type] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
    maxSize,
    maxFiles,
    multiple: true,
  })

  const removeFile = (id: string) => {
    setUploadFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const startUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)

    try {
      // Simulate upload progress for each file
      for (const uploadFile of uploadFiles) {
        if (uploadFile.status !== "pending") continue

        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f)))

        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
        }

        // Mark as complete
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "success" as const, progress: 100 } : f)),
        )
      }

      // Call the upload handler
      const filesToUpload = uploadFiles.map((uf) => uf.file)
      await onUpload(filesToUpload)
    } catch (error) {
      console.error("Upload failed:", error)
      setUploadFiles((prev) =>
        prev.map((f) => (f.status === "uploading" ? { ...f, status: "error" as const, error: "Upload failed" } : f)),
      )
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <Video className="h-5 w-5" />
    if (file.type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const pendingFiles = uploadFiles.filter((f) => f.status === "pending")
  const completedFiles = uploadFiles.filter((f) => f.status === "success")
  const failedFiles = uploadFiles.filter((f) => f.status === "error")

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center cursor-pointer">
            <input {...getInputProps()} />
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>

            {isDragActive ? (
              <div>
                <p className="text-lg font-medium text-indigo-600 mb-2">Drop files here to upload</p>
                <p className="text-sm text-gray-500">Release to start uploading</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">Drag & drop files here, or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">Support for video files up to {formatFileSize(maxSize)}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {acceptedTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.replace("/*", "").toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Files ({uploadFiles.length})</h3>
              {pendingFiles.length > 0 && (
                <Button onClick={startUpload} disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {uploadFile.preview ? (
                      <img
                        src={uploadFile.preview || "/placeholder.svg"}
                        alt={uploadFile.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(uploadFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</p>

                    {/* Progress Bar */}
                    {uploadFile.status === "uploading" && (
                      <div className="mt-2">
                        <Progress value={uploadFile.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">{uploadFile.progress}% uploaded</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === "error" && uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {uploadFile.status === "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadFile.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {uploadFile.status === "uploading" && <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />}
                    {uploadFile.status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {uploadFile.status === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {(completedFiles.length > 0 || failedFiles.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex space-x-4">
                    {completedFiles.length > 0 && (
                      <span className="text-green-600">{completedFiles.length} uploaded successfully</span>
                    )}
                    {failedFiles.length > 0 && <span className="text-red-600">{failedFiles.length} failed</span>}
                  </div>
                  {completedFiles.length > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setUploadFiles([])}>
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
