"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Upload, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProjectUploadProps {
  onProjectCreated: () => void
  hasActiveProject: boolean
}

export function ProjectUpload({ onProjectCreated, hasActiveProject }: ProjectUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    googleDriveLink: "",
    requirements: "",
  })
  const { toast } = useToast()

  const validateGoogleDriveLink = (url: string) => {
    const driveRegex = /^https:\/\/drive\.google\.com\/(drive\/folders\/|file\/d\/)/
    return driveRegex.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.googleDriveLink.trim()) {
      toast({
        title: "Error",
        description: "Project title and Google Drive link are required",
        variant: "destructive",
      })
      return
    }

    if (!validateGoogleDriveLink(formData.googleDriveLink)) {
      toast({
        title: "Error",
        description: "Please provide a valid Google Drive link",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const authToken =
        localStorage.getItem("auth-token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth-token="))
          ?.split("=")[1]

      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Project created successfully! Our team will assign an editor soon.",
        })
        setFormData({ title: "", description: "", googleDriveLink: "", requirements: "" })
        setIsOpen(false)
        onProjectCreated()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled={hasActiveProject}>
          <Plus className="mr-2 h-4 w-4" />
          {hasActiveProject ? "Complete Current Project First" : "Create New Project"}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">
                Project Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter a descriptive project title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">
                Project Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Describe your project, target audience, style preferences, etc."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="googleDriveLink" className="text-slate-300">
                Google Drive Link *
              </Label>
              <Input
                id="googleDriveLink"
                value={formData.googleDriveLink}
                onChange={(e) => setFormData({ ...formData, googleDriveLink: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://drive.google.com/drive/folders/..."
                required
              />
              <p className="text-slate-400 text-sm mt-1">
                Share your Google Drive folder containing raw video files. Make sure it's accessible to anyone with the
                link.
              </p>
            </div>

            <div>
              <Label htmlFor="requirements" className="text-slate-300">
                Special Requirements
              </Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Any specific editing requirements, deadlines, or special instructions"
                rows={3}
              />
            </div>
          </div>

          <Alert className="border-blue-500/50 bg-blue-500/10">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-200">
              <strong>What happens next:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Your project will be created in our system</li>
                <li>• A Frame.io project will be set up for collaboration</li>
                <li>• Our admin will assign a professional editor</li>
                <li>• You'll receive notifications about progress updates</li>
              </ul>
            </AlertDescription>
          </Alert>

          {hasActiveProject && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                You can only have one active project at a time based on your current plan. Please complete or approve
                your current project before creating a new one.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || hasActiveProject} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Creating Project..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
