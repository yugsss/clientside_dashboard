import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Project {
  id: string
  title: string
  description: string
  status: "pending" | "assigned" | "in_progress" | "qc_review" | "client_review" | "completed" | "cancelled"
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
  role: "admin" | "client" | "employee" | "qc"
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
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  initialized: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
  switchDemoAccount: (accountId: string) => void
  requestNewProject: (data: { title: string; description: string }) => Promise<{ success: boolean; error?: string }>
  approveProject: (projectId: string) => Promise<{ success: boolean; error?: string }>
  requestRevision: (projectId: string, feedback: string) => Promise<{ success: boolean; error?: string }>
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
          console.log("🔐 Auth Store: Attempting login for", email)

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include",
          })

          // Check if response is ok before parsing JSON
          if (!response.ok) {
            const errorText = await response.text()
            console.error("Login response error:", response.status, errorText)
            throw new Error(`Login failed: ${response.status}`)
          }

          const data = await response.json()

          if (data.success && data.user) {
            console.log("✅ Auth Store: Login successful for", data.user.email)

            // Transform database user to store format
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              avatar: data.user.avatar || "/placeholder-user.jpg",
              role: data.user.role,
              plan: data.user.plan,
              permissions: data.user.permissions || ["view_projects", "comment"],
              activeProjects: data.user.plan?.activeProjects || 0,
              maxProjects: data.user.plan?.projectLimit === "unlimited" ? -1 : data.user.plan?.projectLimit || 3,
              storageUsed: data.user.storageUsed || 0,
              storageLimit: data.user.storageLimit || 10,
              features: data.user.plan?.features || [],
              projects: data.user.projects || [],
              totalSpent: data.user.totalSpent || 0,
              memberSince: data.user.memberSince,
              memberDays: data.user.memberDays || 0,
            }

            set({
              user,
              isAuthenticated: true,
              loading: false,
              initialized: true,
            })
          } else {
            throw new Error(data.error || "Invalid response from server")
          }
        } catch (error) {
          console.error("💥 Auth Store: Login error:", error)
          set({
            error: error instanceof Error ? error.message : "Login failed. Please try again.",
            loading: false,
          })
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
          console.log("🔍 Auth Store: Checking authentication")

          const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          })

          // Check if response is ok before parsing JSON
          if (!response.ok) {
            if (response.status === 401) {
              console.log("❌ Auth Store: No valid session found")
              set({
                user: null,
                isAuthenticated: false,
                loading: false,
                initialized: true,
              })
              return
            }

            const errorText = await response.text()
            console.error("Auth check response error:", response.status, errorText)
            throw new Error(`Auth check failed: ${response.status}`)
          }

          const data = await response.json()

          if (data.success && data.user) {
            console.log("✅ Auth Store: User authenticated:", data.user.email)

            // Transform database user to store format
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              avatar: data.user.avatar || "/placeholder-user.jpg",
              role: data.user.role,
              plan: data.user.plan,
              permissions: data.user.permissions || ["view_projects", "comment"],
              activeProjects: data.user.plan?.activeProjects || 0,
              maxProjects: data.user.plan?.projectLimit === "unlimited" ? -1 : data.user.plan?.projectLimit || 3,
              storageUsed: data.user.storageUsed || 0,
              storageLimit: data.user.storageLimit || 10,
              features: data.user.plan?.features || [],
              projects: data.user.projects || [],
              totalSpent: data.user.totalSpent || 0,
              memberSince: data.user.memberSince,
              memberDays: data.user.memberDays || 0,
            }

            set({
              user,
              isAuthenticated: true,
              loading: false,
              initialized: true,
            })
          } else {
            console.log("❌ Auth Store: Invalid response from server")
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
              initialized: true,
            })
          }
        } catch (error) {
          console.error("💥 Auth Store: Auth check failed:", error)
          set({
            error: error instanceof Error ? error.message : "Authentication check failed",
            loading: false,
            initialized: true,
            user: null,
            isAuthenticated: false,
          })
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      clearError: () => {
        set({ error: null })
      },

      switchDemoAccount: async (accountId: string) => {
        // Map demo account IDs to actual emails
        const emailMap: Record<string, string> = {
          "sarah-johnson": "sarah@example.com",
          "mike-chen": "mike@example.com",
          "emily-rodriguez": "emily@example.com",
          "admin-user": "admin@editlobby.com",
          editor1: "editor1@editlobby.com",
          editor2: "editor2@editlobby.com",
          qc1: "qc1@editlobby.com",
          qc2: "qc2@editlobby.com",
        }

        const email = emailMap[accountId]
        if (email) {
          await get().login(email, "demo123")
        }
      },

      requestNewProject: async (data: { title: string; description: string }) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { success: true }
        } catch (error) {
          return { success: false, error: "Failed to create project" }
        }
      },

      approveProject: async (projectId: string) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { success: true }
        } catch (error) {
          return { success: false, error: "Failed to approve project" }
        }
      },

      requestRevision: async (projectId: string, feedback: string) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return { success: true }
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

  const canAccessInternalDashboard = (): boolean => {
    if (!user) return false
    return ["admin", "employee", "qc"].includes(user.role)
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
    canAccessInternalDashboard,
    getMaxProjects,
    getStorageLimit,
    canCreateProject,
    user,
  }
}
