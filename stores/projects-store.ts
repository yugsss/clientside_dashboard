import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Project, Video } from "../types"
import { frameioService } from "../lib/frameio"
import { demoUsers, demoProjects } from "../lib/demo-data"

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

// Enhanced mock projects data with Frame.io v4 features for all plan types
const mockProjects: Project[] = [
  // Basic Plan Project
  {
    id: "mock-1",
    title: "🎬 Basic Plan Demo - Frame.io v4",
    name: "🎬 Basic Plan Demo - Frame.io v4",
    description: "Showcase Frame.io v4 basic features: comments, reactions, and simple collaboration",
    clientId: "demo-basic",
    assignedEditor: "demo-editor@company.com",
    status: "in_progress",
    priority: "medium",
    progress: 60,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-25T15:30:00Z",
    deadline: "2024-02-01T17:00:00Z",
    frameioProjectId: "frameio-basic-demo",
    frameioAssetId: "frameio-asset-basic-demo",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=🎬+Basic+Frame.io+v4",
    duration: 90,
    revisions: 1,
    maxRevisions: 2,
    canApprove: true,
    canRequestRevision: true,
    tags: ["basic", "demo", "frame-io-v4", "active"],
  },
  // Pro Plan Project
  {
    id: "mock-2",
    title: "🚀 Pro Plan Demo - Frame.io v4",
    name: "🚀 Pro Plan Demo - Frame.io v4",
    description:
      "Advanced Frame.io v4 Pro features: analytics, team collaboration, priority support, and advanced workflows",
    clientId: "demo-pro",
    assignedEditor: "pro-editor@company.com",
    status: "in_review",
    priority: "high",
    progress: 85,
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-25T16:45:00Z",
    deadline: "2024-01-30T17:00:00Z",
    frameioProjectId: "frameio-pro-demo",
    frameioAssetId: "frameio-asset-pro-demo",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=🚀+Pro+Frame.io+v4",
    duration: 120,
    revisions: 0,
    maxRevisions: 3,
    canApprove: true,
    canRequestRevision: true,
    tags: ["pro", "demo", "frame-io-v4", "analytics", "active"],
  },
  // Premium Plan Project
  {
    id: "mock-3",
    title: "🎨 Premium Plan Demo - Frame.io v4",
    name: "🎨 Premium Plan Demo - Frame.io v4",
    description:
      "Premium Frame.io v4 features: white-label interface, custom workflows, advanced permissions, and 4K support",
    clientId: "demo-premium",
    assignedEditor: "premium-editor@company.com",
    status: "in_progress",
    priority: "urgent",
    progress: 45,
    createdAt: "2024-01-20T11:00:00Z",
    updatedAt: "2024-01-25T18:30:00Z",
    deadline: "2024-01-28T17:00:00Z",
    frameioProjectId: "frameio-premium-demo",
    frameioAssetId: "frameio-asset-premium-demo",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=🎨+Premium+Frame.io+v4",
    duration: 180,
    revisions: 2,
    maxRevisions: 5,
    canApprove: true,
    canRequestRevision: true,
    tags: ["premium", "demo", "frame-io-v4", "white-label", "4k", "active"],
  },
  // Enterprise Plan Project
  {
    id: "mock-4",
    title: "🏢 Enterprise Plan Demo - Frame.io v4",
    name: "🏢 Enterprise Plan Demo - Frame.io v4",
    description:
      "Enterprise Frame.io v4 features: custom API integrations, dedicated infrastructure, advanced security, SSO, and global collaboration",
    clientId: "demo-enterprise",
    assignedEditor: "enterprise-editor@company.com",
    status: "in_review",
    priority: "high",
    progress: 75,
    createdAt: "2024-01-16T08:00:00Z",
    updatedAt: "2024-01-25T19:45:00Z",
    deadline: "2024-02-05T17:00:00Z",
    frameioProjectId: "frameio-enterprise-demo",
    frameioAssetId: "frameio-asset-enterprise-demo",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=🏢+Enterprise+Frame.io+v4",
    duration: 240,
    revisions: 1,
    maxRevisions: 999,
    canApprove: true,
    canRequestRevision: true,
    tags: ["enterprise", "demo", "frame-io-v4", "api", "security", "global", "active"],
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
          console.log("✅ Frame.io v4 service initialized in projects store")
        } catch (error) {
          console.warn("⚠️ Frame.io v4 initialization failed, using enhanced demo data:", error)
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
            // Use enhanced demo data with Frame.io v4 features
            if (userId) {
              // Get user-specific projects from demo data
              const user = demoUsers.find((u) => u.id === userId)
              projects = user?.projects || []
              console.log(`📝 Using user-specific Frame.io v4 projects for user ${userId}:`, projects.length)
            } else {
              // Return all demo projects for showcase
              projects = demoProjects
              console.log("📝 Using all Frame.io v4 demo projects:", projects.length)
            }
          } else {
            // Fetch from Frame.io API
            const frameioProjects = await frameioService.getProjects()
            projects = frameioProjects.map((fp) => ({
              id: fp.id,
              title: fp.name,
              name: fp.name,
              description: fp.description || "",
              clientId: userId || "1",
              status: "pending" as const,
              priority: "medium" as const,
              progress: 0,
              createdAt: fp.created_at,
              updatedAt: fp.updated_at,
              frameioProjectId: fp.id,
              frameioAssetId: "",
              videoUrl: "",
              thumbnailUrl: "/placeholder.svg?height=200&width=300",
              duration: 0,
              revisions: 0,
              maxRevisions: 2,
              canApprove: false,
              canRequestRevision: false,
              tags: ["frame-io-v4"],
            }))
          }

          set({ projects, loading: false })
          console.log(`✅ Loaded ${projects.length} Frame.io v4 projects`)
        } catch (error) {
          console.error("Failed to fetch Frame.io v4 projects:", error)
          set({
            error: "Failed to load projects. Please try again.",
            loading: false,
            projects: userId ? demoUsers.find((u) => u.id === userId)?.projects || [] : demoProjects,
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
            // Enhanced mock videos data with Frame.io v4 features
            videos = [
              {
                id: `video-${projectId}-1`,
                projectId,
                title: "Frame_io_v4_Final_Cut.mp4",
                frameioAssetId: `frameio-asset-${projectId}-1`,
                frameioUrl: "https://mock-frameio-v4.com/embed/video1",
                thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Frame.io+v4+Video",
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
                title: "Frame_io_v4_Review_Cut.mp4",
                frameioAssetId: `frameio-asset-${projectId}-2`,
                frameioUrl: "https://mock-frameio-v4.com/embed/video2",
                thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Frame.io+v4+Review",
                duration: "2:15",
                version: 2,
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
          console.error("Failed to fetch Frame.io v4 project videos:", error)
          set({ error: "Failed to load videos. Please try again.", loading: false })
        }
      },

      createProject: async (projectData) => {
        try {
          set({ loading: true, error: null })

          let newProject: Project

          if (frameioService.isUsingMockData()) {
            // Create mock project with Frame.io v4 features
            newProject = {
              ...projectData,
              id: `frameio-v4-project-${Date.now()}`,
              name: projectData.title,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              frameioProjectId: `frameio-v4-${Date.now()}`,
              frameioAssetId: `frameio-v4-asset-${Date.now()}`,
              videoUrl: "",
              thumbnailUrl: "/placeholder.svg?height=200&width=300&text=New+Frame.io+v4+Project",
              duration: 0,
              revisions: 0,
              canApprove: false,
              canRequestRevision: false,
              tags: [...(projectData.tags || []), "frame-io-v4", "new"],
            }
          } else {
            // Create in Frame.io
            const frameioProject = await frameioService.createProject(projectData.title, projectData.description)

            newProject = {
              ...projectData,
              id: frameioProject.id,
              name: frameioProject.name,
              createdAt: frameioProject.created_at,
              updatedAt: frameioProject.updated_at,
              frameioProjectId: frameioProject.id,
              frameioAssetId: "",
              videoUrl: "",
              thumbnailUrl: "/placeholder.svg?height=200&width=300",
              duration: 0,
              revisions: 0,
              canApprove: false,
              canRequestRevision: false,
              tags: [...(projectData.tags || []), "frame-io-v4"],
            }
          }

          set((state) => ({
            projects: [...state.projects, newProject],
            loading: false,
          }))

          console.log("✅ Created new Frame.io v4 project:", newProject.id)
          return newProject
        } catch (error) {
          console.error("Failed to create Frame.io v4 project:", error)
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

          console.log("✅ Updated Frame.io v4 project:", id)
        } catch (error) {
          console.error("Failed to update Frame.io v4 project:", error)
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

          console.log("✅ Deleted Frame.io v4 project:", id)
        } catch (error) {
          console.error("Failed to delete Frame.io v4 project:", error)
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
            // Mock upload with Frame.io v4 features
            newVideo = {
              id: `frameio-v4-video-${Date.now()}`,
              projectId,
              title: file.name,
              frameioAssetId: `frameio-v4-asset-${Date.now()}`,
              frameioUrl: "https://mock-frameio-v4.com/embed/new-video",
              thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Frame.io+v4+Upload",
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

          console.log("✅ Uploaded video to Frame.io v4 project:", newVideo.id)
          return newVideo
        } catch (error) {
          console.error("Failed to upload video to Frame.io v4:", error)
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

          console.log("✅ Updated Frame.io v4 project status:", projectId, status)
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
