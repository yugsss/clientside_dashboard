import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Project {
  id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "in_review" | "completed" | "cancelled"
  progress: number
  createdAt: string
  revisions: number
  maxRevisions: number
  canApprove?: boolean
  canRequestRevision?: boolean
  dueDate?: string
}

export interface PlanDetails {
  id: string
  name: string
  price: number
  type: "monthly" | "per-video"
  features: string[]
  canRequestNewProject: boolean
  activeProjects: number
  projectsUsed: number
  projectLimit: number | "unlimited"
  monthlyReset?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "admin" | "client" | "internal"
  plan: PlanDetails
  permissions: string[]
  activeProjects: number
  maxProjects: number
  storageUsed: number
  storageLimit: number
  features: string[]
  projects?: Project[]
  totalSpent?: number
  memberSince?: string
  memberDays?: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  initialized: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
  createAccountFromPayment: (token: string) => Promise<void>
  requestNewProject: (data: { title: string; description: string }) => Promise<{ success: boolean; error?: string }>
  approveProject: (projectId: string) => Promise<{ success: boolean; error?: string }>
  requestRevision: (projectId: string, feedback: string) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      initialized: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Login failed")
          }

          if (data.success && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              loading: false,
              initialized: true,
            })
          } else {
            throw new Error("Invalid response from server")
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed. Please try again.",
            loading: false,
          })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ loading: true, error: null })

        try {
          if (data.password !== data.confirmPassword) {
            throw new Error("Passwords do not match")
          }

          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: data.name,
              email: data.email,
              password: data.password,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Registration failed")
          }

          if (result.success) {
            // After successful registration, automatically log in
            await get().login(data.email, data.password)
          } else {
            throw new Error("Registration failed")
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Registration failed. Please try again.",
            loading: false,
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          })
        } catch (error) {
          console.error("Logout error:", error)
        }

        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },

      checkAuth: async () => {
        if (get().initialized) return

        set({ loading: true })

        try {
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              set({
                user: data.user,
                isAuthenticated: true,
                loading: false,
                initialized: true,
              })
              return
            }
          }

          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            initialized: true,
          })
        } catch (error) {
          console.error("Auth check failed:", error)
          set({
            error: "Authentication check failed",
            loading: false,
            initialized: true,
          })
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      clearError: () => {
        set({ error: null })
      },

      createAccountFromPayment: async (token: string) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch("/api/auth/create-from-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Failed to create account")
          }

          if (data.success && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              loading: false,
              initialized: true,
            })
          } else {
            throw new Error("Invalid response from server")
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create account",
            loading: false,
          })
          throw error
        }
      },

      requestNewProject: async (data: { title: string; description: string }) => {
        try {
          const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (response.ok) {
            return { success: true }
          } else {
            return { success: false, error: result.error || "Failed to create project" }
          }
        } catch (error) {
          return { success: false, error: "Failed to create project" }
        }
      },

      approveProject: async (projectId: string) => {
        try {
          const response = await fetch(`/api/projects/${projectId}/approve`, {
            method: "POST",
          })

          const result = await response.json()

          if (response.ok) {
            return { success: true }
          } else {
            return { success: false, error: result.error || "Failed to approve project" }
          }
        } catch (error) {
          return { success: false, error: "Failed to approve project" }
        }
      },

      requestRevision: async (projectId: string, feedback: string) => {
        try {
          const response = await fetch(`/api/projects/${projectId}/revision`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ feedback }),
          })

          const result = await response.json()

          if (response.ok) {
            return { success: true }
          } else {
            return { success: false, error: result.error || "Failed to request revision" }
          }
        } catch (error) {
          return { success: false, error: "Failed to request revision" }
        }
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
)

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user)

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.permissions.includes("all")) return true
    return user.permissions.includes(permission)
  }

  const canAccessFeature = (feature: string): boolean => {
    if (!user) return false

    const planFeatures = {
      basic: ["view_projects", "comment", "download_low_res"],
      monthly: ["view_projects", "comment", "download_low_res", "upload_files", "version_control"],
      premium: [
        "view_projects",
        "comment",
        "download_high_res",
        "upload_files",
        "create_projects",
        "manage_team",
        "analytics",
      ],
      ultimate: ["all"],
    }

    const userFeatures = planFeatures[user.plan.id as keyof typeof planFeatures] || []
    return userFeatures.includes("all") || userFeatures.includes(feature)
  }

  const getMaxProjects = (): number => {
    if (!user) return 0
    return user.maxProjects
  }

  const getStorageLimit = (): number => {
    if (!user) return 0
    return user.storageLimit
  }

  const canCreateProject = (): boolean => {
    if (!user) return false
    if (user.maxProjects === -1) return true
    return user.activeProjects < user.maxProjects
  }

  return {
    hasPermission,
    canAccessFeature,
    getMaxProjects,
    getStorageLimit,
    canCreateProject,
    user,
  }
}
