export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "editor" | "client"
  company: string
  plan: {
    id: string
    name: string
    price: number
    type: "monthly" | "per_video"
    features: string[]
    projectLimit: number
    projectsUsed: number
    activeProjects: number
    canRequestNewProject: boolean
    maxRevisions: number
  }
  projects: string[]
  totalSpent: number
  memberSince: string
  memberDays: number
}

export interface Project {
  id: string
  title: string
  name: string
  description: string
  status: "pending" | "in_progress" | "review" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  progress: number
  clientId: string
  videoUrl?: string
  thumbnailUrl?: string
  duration: number
  createdAt: string
  updatedAt: string
  revisions: number
  maxRevisions: number
  canApprove: boolean
  canRequestRevision: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "system" | "project" | "comment" | "billing"
  read: boolean
  createdAt: string
  actionUrl?: string
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
  replies: VideoComment[]
  type: "general" | "technical" | "creative"
  priority: "low" | "medium" | "high" | "urgent"
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

export interface FrameioProject {
  id: string
  name: string
  description: string
  private: boolean
  team_id: string
  root_asset_id: string
  created_at: string
  updated_at: string
}

export interface FrameioAsset {
  id: string
  name: string
  type: "file" | "folder"
  parent_id: string
  project_id: string
  filesize?: number
  duration?: number
  framerate?: number
  width?: number
  height?: number
  thumbnail?: string
  download_url?: string
  stream_url?: string
  created_at: string
  updated_at: string
}

export interface FrameioComment {
  id: string
  text: string
  timestamp?: number
  page?: number
  x_coordinate?: number
  y_coordinate?: number
  asset_id: string
  owner: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  replies: FrameioComment[]
  created_at: string
  updated_at: string
  resolved: boolean
  priority?: "low" | "medium" | "high" | "urgent"
  category?: string
  tags?: string[]
  reactions?: {
    emoji: string
    count: number
    users: string[]
  }[]
}
