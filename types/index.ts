export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "employee" | "client"
  company: string
  plan: UserPlan
  projects?: Project[]
  totalSpent: number
  memberSince: string
  memberDays: number
}

export interface UserPlan {
  id: string
  name: string
  price: number
  type: "per_video" | "monthly"
  features: string[]
  projectLimit: number | "unlimited"
  projectsUsed: number
  activeProjects: number
  canRequestNewProject: boolean
  monthlyReset?: string
  maxRevisions: number
}

export interface Project {
  id: string
  title: string
  name: string
  description: string
  status: "pending" | "in_progress" | "in_review" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  progress: number
  clientId: string
  frameioProjectId?: string
  frameioAssetId?: string
  videoUrl: string
  thumbnailUrl: string
  duration: number // in seconds
  createdAt: string
  updatedAt: string
  dueDate?: string
  completedAt?: string
  revisions: number
  maxRevisions: number
  canApprove: boolean
  canRequestRevision: boolean
}

export interface VideoComment {
  id: string
  projectId: string
  videoId: string
  userId: string
  userName: string
  userRole: string
  userAvatar: string
  content: string
  startTime: number
  endTime?: number
  timestamp: number
  createdAt: string
  updatedAt: string
  resolved: boolean
  resolvedAt?: string
  replies: CommentReply[]
  type: "general" | "revision_request" | "approval"
  priority: "low" | "medium" | "high"
}

export interface CommentReply {
  id: string
  commentId: string
  userId: string
  userName: string
  userRole: string
  userAvatar: string
  content: string
  createdAt: string
}

export interface PlanDetails {
  id: string
  name: string
  price: number
  billing: "per_video" | "monthly"
  projectLimit: number | "unlimited"
  features: string[]
  turnaround: string
  revisions: number
  description: string
  badge?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "comment" | "project_update" | "system" | "billing"
  read: boolean
  createdAt: string
  actionUrl?: string
}

export interface Settings {
  notifications: {
    email: boolean
    push: boolean
    comments: boolean
    projectUpdates: boolean
    billing: boolean
  }
  privacy: {
    profileVisible: boolean
    activityVisible: boolean
  }
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    timezone: string
  }
}
