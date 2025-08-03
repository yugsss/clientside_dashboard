import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { demoUsers } from "../lib/demo-data"
import type { User, Project } from "../types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchDemoAccount: (userId: string) => void
  requestNewProject: (projectData: { title: string; description: string }) => Promise<{
    success: boolean
    error?: string
  }>
  approveProject: (projectId: string) => Promise<{ success: boolean; error?: string }>
  requestRevision: (projectId: string, feedback: string) => Promise<{ success: boolean; error?: string }>
  updateProject: (projectId: string, updates: Partial<Project>) => void
  clearError: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ loading: true, error: null })

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Find demo user by email
            const user = demoUsers.find((u) => u.email === email)

            if (user && password === "demo123") {
              set({ user, isAuthenticated: true, loading: false })
              return true
            } else {
              set({ error: "Invalid credentials", loading: false })
              return false
            }
          } catch (error) {
            set({ error: "Login failed", loading: false })
            return false
          }
        },

        logout: () => {
          set({ user: null, isAuthenticated: false, error: null })
        },

        switchDemoAccount: (userId: string) => {
          const user = demoUsers.find((u) => u.id === userId)
          if (user) {
            set({ user, isAuthenticated: true })
          }
        },

        requestNewProject: async (projectData: { title: string; description: string }) => {
          const { user } = get()
          if (!user) return { success: false, error: "Not authenticated" }

          // Check if user has active projects
          const activeProjects =
            user.projects?.filter((p) => p.status === "in_progress" || p.status === "in_review") || []
          if (activeProjects.length > 0) {
            return {
              success: false,
              error: "You can only have one active project at a time. Please complete your current project first.",
            }
          }

          // Check plan limits for monthly plans
          if (user.plan.type === "monthly" && user.plan.projectLimit !== "unlimited") {
            if (user.plan.projectsUsed >= user.plan.projectLimit) {
              return {
                success: false,
                error:
                  "You have reached your monthly project limit. Please upgrade your plan or wait for the next billing cycle.",
              }
            }
          }

          // Create new project
          const newProject: Project = {
            id: `proj-${Date.now()}`,
            title: projectData.title,
            name: projectData.title,
            description: projectData.description,
            status: "in_progress",
            priority: "medium",
            progress: 0,
            clientId: user.id,
            frameioProjectId: `frameio-${Date.now()}`,
            frameioAssetId: `asset-${Date.now()}`,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnailUrl: "/placeholder.svg?height=180&width=320&text=New+Project",
            duration: 60,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            revisions: 0,
            maxRevisions: user.plan.maxRevisions,
            canApprove: false,
            canRequestRevision: false,
          }

          // Update user data
          const updatedUser = {
            ...user,
            projects: [...(user.projects || []), newProject],
            plan: {
              ...user.plan,
              projectsUsed: user.plan.type === "monthly" ? user.plan.projectsUsed + 1 : user.plan.projectsUsed,
              activeProjects: user.plan.activeProjects + 1,
              canRequestNewProject: false,
            },
          }

          set({ user: updatedUser })
          return { success: true }
        },

        approveProject: async (projectId: string) => {
          const { user } = get()
          if (!user) return { success: false, error: "Not authenticated" }

          const project = user.projects?.find((p) => p.id === projectId)
          if (!project) return { success: false, error: "Project not found" }

          if (!project.canApprove) {
            return { success: false, error: "Project cannot be approved at this time" }
          }

          // Update project status to completed
          const updatedProjects =
            user.projects?.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    status: "completed" as const,
                    progress: 100,
                    completedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    canApprove: false,
                    canRequestRevision: false,
                  }
                : p,
            ) || []

          const updatedUser = {
            ...user,
            projects: updatedProjects,
            plan: {
              ...user.plan,
              activeProjects: Math.max(0, user.plan.activeProjects - 1),
              canRequestNewProject: true,
            },
          }

          set({ user: updatedUser })
          return { success: true }
        },

        requestRevision: async (projectId: string, feedback: string) => {
          const { user } = get()
          if (!user) return { success: false, error: "Not authenticated" }

          const project = user.projects?.find((p) => p.id === projectId)
          if (!project) return { success: false, error: "Project not found" }

          if (!project.canRequestRevision) {
            return { success: false, error: "No more revisions available for this project" }
          }

          if (project.revisions >= project.maxRevisions) {
            return { success: false, error: `Maximum revisions (${project.maxRevisions}) reached for this plan` }
          }

          // Update project with revision request
          const updatedProjects =
            user.projects?.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    status: "in_progress" as const,
                    revisions: p.revisions + 1,
                    updatedAt: new Date().toISOString(),
                    canApprove: false,
                    canRequestRevision: p.revisions + 1 < p.maxRevisions,
                  }
                : p,
            ) || []

          const updatedUser = {
            ...user,
            projects: updatedProjects,
          }

          set({ user: updatedUser })
          return { success: true }
        },

        updateProject: (projectId: string, updates: Partial<Project>) => {
          const { user } = get()
          if (!user) return

          const updatedProjects =
            user.projects?.map((p) =>
              p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
            ) || []

          set({
            user: {
              ...user,
              projects: updatedProjects,
            },
          })
        },

        clearError: () => {
          set({ error: null })
        },

        checkAuth: () => {
          // This function can be used to check authentication status
          const { user } = get()
          set({ isAuthenticated: !!user })
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: "auth-store" },
  ),
)
