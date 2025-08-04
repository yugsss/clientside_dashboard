import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Project, Video } from "../types"
import { frameioService } from "../lib/frameio"
import { demoUsers } from "../lib/demo-data"

interface ProjectsState {
  projects: Project[]
  videos: Record<string, Video[]>
  loading: boolean
  error: string | null
  initialized: boolean
  selectedProject: Project | null

  // Actions
  fetchProjects: (userId?: string) => Promise<void>
  fetchProjectVideos: (projectId: string) => Promise<void>
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  uploadVideo: (projectId: string, file: File) => Promise<Video>
  initializeFrameIO: () => Promise<void>
  clearError: () => void
  updateProjectStatus: (projectId: string, status: Project["status"]) => Promise<void>
  setSelectedProject: (project: Project | null) => void
  getProjectsByUser: (userId: string) => Project[]
}

// Mock projects data for development
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Brand Campaign 2024",
    description: "Main brand campaign video project with multiple deliverables",
    clientId: "1",
    assignedEditor: "sarah@company.com",
    status: "in_progress",
    priority: "high",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    deadline: "2024-01-30T17:00:00Z",
    frameioProjectId: "mock-frameio-1",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    duration: "2:30",
    tags: ["brand", "campaign", "2024", "marketing"],
  },
  {
    id: "2",
    title: "Product Demo Series",
    description: "Series of product demonstration videos for new product launch",
    clientId: "1",
    assignedEditor: "editor@company.com",
    status: "review",
    priority: "medium",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
    deadline: "2024-01-25T12:00:00Z",
    frameioProjectId: "mock-frameio-2",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    duration: "1:45",
    tags: ["product", "demo", "tutorial", "launch"],
  },
  {
    id: "3",
    title: "Social Media Content",
    description: "Short-form content for social media platforms",
    clientId: "2",
    assignedEditor: "alex@company.com",
    status: "revision",
    priority: "urgent",
    createdAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-19T11:45:00Z",
    deadline: "2024-01-23T15:00:00Z",
    frameioProjectId: "mock-frameio-3",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    duration: "0:30",
    tags: ["social", "instagram", "tiktok", "short-form"],
  },
  {
    id: "4",
    title: "Corporate Training Video",
    description: "Internal training video for employee onboarding",
    clientId: "3",
    assignedEditor: "sarah@company.com",
    status: "completed",
    priority: "low",
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-15T16:30:00Z",
    deadline: "2024-01-20T17:00:00Z",
    frameioProjectId: "mock-frameio-4",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    duration: "15:20",
    tags: ["corporate", "training", "onboarding", "internal"],
  },
  {
    id: "5",
    title: "Event Highlight Reel",
    description: "Highlight reel from company annual conference",
    clientId: "1",
    assignedEditor: "editor@company.com",
    status: "pending",
    priority: "medium",
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
    deadline: "2024-02-01T17:00:00Z",
    frameioProjectId: "mock-frameio-5",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    duration: "3:15",
    tags: ["event", "conference", "highlights", "corporate"],
  },
]

export const useProjectsStore = create<ProjectsState>()(
  devtools(
    (set, get) => ({
      projects: [],
      videos: {},
      loading: false,
      error: null,
      initialized: false,
      selectedProject: null,

      initializeFrameIO: async () => {
        try {
          await frameioService.initialize()
          console.log("✅ Frame.io service initialized in projects store")
        } catch (error) {
          console.warn("⚠️ Frame.io initialization failed, using mock data:", error)
        }
      },

      fetchProjects: async (userId?: string) => {
        try {
          set({ loading: true, error: null })

          // Initialize Frame.io if not already done
          if (!get().initialized) {
            await get().initializeFrameIO()
            set({ initialized: true })
          }

          let projects: Project[]

          if (frameioService.isUsingMockData()) {
            // Use mock data for development
            projects = mockProjects
            console.log("📝 Using mock projects data")
          } else {
            // Fetch from Frame.io API
            const frameioProjects = await frameioService.getProjects()
            projects = frameioProjects.map((fp) => ({
              id: fp.id,
              title: fp.name,
              description: fp.description || "",
              clientId: "1", // This would come from your user management system
              status: "pending" as const,
              priority: "medium" as const,
              createdAt: fp.created_at,
              updatedAt: fp.updated_at,
              frameioProjectId: fp.id,
              tags: [],
            }))
          }

          // If userId is provided, filter projects for that specific user
          if (userId) {
            const user = demoUsers.find((u) => u.id === userId)
            projects = user?.projects || []
          }

          set({ projects, loading: false })
        } catch (error) {
          console.error("Failed to fetch projects:", error)
          set({
            error: "Failed to load projects. Please try again.",
            loading: false,
            projects: mockProjects, // Fallback to mock data
          })
        }
      },

      fetchProjectVideos: async (projectId: string) => {
        try {
          set({ loading: true, error: null })

          const project = get().projects.find((p) => p.id === projectId)
          if (!project?.frameioProjectId) {
            throw new Error("Project not found or missing Frame.io ID")
          }

          let videos: Video[]

          if (frameioService.isUsingMockData()) {
            // Mock videos data
            videos = [
              {
                id: `video-${projectId}-1`,
                projectId,
                title: "Final_Cut_v3.mp4",
                frameioAssetId: `mock-asset-${projectId}-1`,
                frameioUrl: "https://mock-frameio.com/embed/video1",
                thumbnailUrl: "/placeholder.svg?height=180&width=320",
                duration: "2:30",
                version: 3,
                status: "ready",
                uploadedAt: "2024-01-20T15:30:00Z",
                fileSize: "524 MB",
                resolution: "1920x1080",
              },
              {
                id: `video-${projectId}-2`,
                projectId,
                title: "Rough_Cut_v1.mp4",
                frameioAssetId: `mock-asset-${projectId}-2`,
                frameioUrl: "https://mock-frameio.com/embed/video2",
                thumbnailUrl: "/placeholder.svg?height=180&width=320",
                duration: "2:15",
                version: 1,
                status: "needs_revision",
                uploadedAt: "2024-01-18T10:00:00Z",
                fileSize: "445 MB",
                resolution: "1920x1080",
              },
            ]
          } else {
            // Fetch from Frame.io API
            const frameioAssets = await frameioService.getAssets(project.frameioProjectId)
            videos = frameioAssets
              .filter((asset) => asset.type === "file")
              .map((asset) => ({
                id: asset.id,
                projectId,
                title: asset.name,
                frameioAssetId: asset.id,
                frameioUrl: asset.stream_url || "",
                thumbnailUrl: asset.thumbnail || "/placeholder.svg?height=180&width=320",
                duration: asset.duration
                  ? `${Math.floor(asset.duration / 60)}:${(asset.duration % 60).toFixed(0).padStart(2, "0")}`
                  : "0:00",
                version: 1,
                status: "ready" as const,
                uploadedAt: asset.created_at,
                fileSize: asset.filesize ? `${Math.round(asset.filesize / 1024 / 1024)} MB` : "Unknown",
                resolution: asset.resolution || "Unknown",
              }))
          }

          set((state) => ({
            videos: { ...state.videos, [projectId]: videos },
            loading: false,
          }))
        } catch (error) {
          console.error("Failed to fetch project videos:", error)
          set({ error: "Failed to load videos. Please try again.", loading: false })
        }
      },

      createProject: async (projectData) => {
        try {
          set({ loading: true, error: null })

          let newProject: Project

          if (frameioService.isUsingMockData()) {
            // Create mock project
            newProject = {
              ...projectData,
              id: `mock-project-${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              frameioProjectId: `mock-frameio-${Date.now()}`,
            }
          } else {
            // Create in Frame.io
            const frameioProject = await frameioService.createProject(projectData.title, projectData.description)

            newProject = {
              ...projectData,
              id: frameioProject.id,
              createdAt: frameioProject.created_at,
              updatedAt: frameioProject.updated_at,
              frameioProjectId: frameioProject.id,
            }
          }

          set((state) => ({
            projects: [...state.projects, newProject],
            loading: false,
          }))

          return newProject
        } catch (error) {
          console.error("Failed to create project:", error)
          set({ error: "Failed to create project. Please try again.", loading: false })
          throw error
        }
      },

      updateProject: async (id, updates) => {
        try {
          set({ loading: true, error: null })

          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project,
            ),
            loading: false,
          }))
        } catch (error) {
          console.error("Failed to update project:", error)
          set({ error: "Failed to update project. Please try again.", loading: false })
        }
      },

      deleteProject: async (id) => {
        try {
          set({ loading: true, error: null })

          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            loading: false,
          }))
        } catch (error) {
          console.error("Failed to delete project:", error)
          set({ error: "Failed to delete project. Please try again.", loading: false })
        }
      },

      uploadVideo: async (projectId, file) => {
        try {
          set({ loading: true, error: null })

          const project = get().projects.find((p) => p.id === projectId)
          if (!project?.frameioProjectId) {
            throw new Error("Project not found or missing Frame.io ID")
          }

          let newVideo: Video

          if (frameioService.isUsingMockData()) {
            // Mock upload
            newVideo = {
              id: `mock-video-${Date.now()}`,
              projectId,
              title: file.name,
              frameioAssetId: `mock-asset-${Date.now()}`,
              frameioUrl: "https://mock-frameio.com/embed/new-video",
              thumbnailUrl: "/placeholder.svg?height=180&width=320",
              duration: "0:00",
              version: 1,
              status: "processing",
              uploadedAt: new Date().toISOString(),
              fileSize: `${Math.round(file.size / 1024 / 1024)} MB`,
              resolution: "1920x1080",
            }
          } else {
            // Upload to Frame.io
            const frameioAsset = await frameioService.uploadAsset(project.frameioProjectId, file)
            newVideo = {
              id: frameioAsset.id,
              projectId,
              title: frameioAsset.name,
              frameioAssetId: frameioAsset.id,
              frameioUrl: "",
              thumbnailUrl: "/placeholder.svg?height=180&width=320",
              duration: "0:00",
              version: 1,
              status: "processing",
              uploadedAt: frameioAsset.created_at,
              fileSize: frameioAsset.filesize ? `${Math.round(frameioAsset.filesize / 1024 / 1024)} MB` : "Unknown",
              resolution: "Unknown",
            }
          }

          set((state) => ({
            videos: {
              ...state.videos,
              [projectId]: [...(state.videos[projectId] || []), newVideo],
            },
            loading: false,
          }))

          return newVideo
        } catch (error) {
          console.error("Failed to upload video:", error)
          set({ error: "Failed to upload video. Please try again.", loading: false })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      updateProjectStatus: async (projectId: string, status: Project["status"]) => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    status,
                    updatedAt: new Date().toISOString(),
                    completedAt: status === "completed" ? new Date().toISOString() : project.completedAt,
                  }
                : project,
            ),
          }))
        } catch (error) {
          set({ error: "Failed to update project status" })
        }
      },

      setSelectedProject: (project: Project | null) => {
        set({ selectedProject: project })
      },

      getProjectsByUser: (userId: string) => {
        const user = demoUsers.find((u) => u.id === userId)
        return user?.projects || []
      },
    }),
    { name: "projects-store" },
  ),
)
