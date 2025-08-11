// Frame.io v4 API Types and Utilities

export interface FrameioAccount {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: string
  created_at: string
  updated_at: string
}

export interface FrameioTeam {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  members_count: number
  projects_count: number
}

export interface FrameioProject {
  id: string
  name: string
  description?: string
  team_id?: string
  creator_id: string
  created_at: string
  updated_at: string
  status: "active" | "archived" | "deleted"
  privacy: "public" | "private" | "team"

  // v4 features
  collaboration_settings?: {
    allow_comments: boolean
    allow_reactions: boolean
    require_approval: boolean
    auto_resolve_comments: boolean
  }

  analytics?: {
    total_views: number
    total_comments: number
    active_collaborators: number
    last_activity: string
  }
}

export interface FrameioAsset {
  id: string
  name: string
  type: "file" | "folder"
  parent_id?: string
  project_id: string
  creator_id: string
  created_at: string
  updated_at: string

  // File properties
  filesize?: number
  filetype?: string
  original_name?: string

  // Media properties
  width?: number
  height?: number
  duration?: number
  fps?: number
  codec?: string
  bitrate?: number

  // URLs
  original_url?: string
  download_url?: string
  streaming_url?: string
  thumbnail_url?: string
  proxy_url?: string

  // Processing
  processing_status?: "queued" | "processing" | "completed" | "failed"
  processing_progress?: number
  transcoding_status?: "queued" | "processing" | "completed" | "failed"

  // Metadata
  metadata?: {
    [key: string]: any
  }

  // Checksums
  checksums?: {
    md5?: string
    sha256?: string
  }

  // v4 features
  analytics?: {
    view_count: number
    comment_count: number
    download_count: number
    last_viewed_at?: string
  }

  approval_status?: "pending" | "approved" | "rejected"
  approval_workflow?: {
    required_approvers: string[]
    current_approvers: string[]
    deadline?: string
  }
}

export interface FrameioComment {
  id: string
  text: string
  asset_id: string
  author: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  created_at: string
  updated_at: string

  // Timing
  timestamp?: number

  // Status
  resolved?: boolean
  resolved_by?: string
  resolved_at?: string

  // v4 features
  priority?: "low" | "medium" | "high" | "urgent"
  category?: string
  tags?: string[]
  mentions?: string[]

  // Reactions (v4)
  reactions?: {
    [emoji: string]: Array<{
      id: string
      name: string
      avatar_url?: string
    }>
  }

  // Threading
  parent_comment_id?: string
  replies_count?: number

  // Visual annotations
  annotation?: {
    type: "point" | "rectangle" | "arrow" | "text"
    coordinates: {
      x: number
      y: number
      width?: number
      height?: number
    }
    color?: string
    stroke_width?: number
  }

  // Task management (v4)
  task?: {
    assignee_id?: string
    due_date?: string
    status?: "open" | "in_progress" | "completed" | "cancelled"
    priority?: "low" | "medium" | "high" | "urgent"
  }
}

export interface FrameioWebhookEvent {
  event_type: string
  resource_type: string
  resource_id: string
  timestamp: string
  data: any
}

// Frame.io API Client
export class FrameioClient {
  private apiKey: string
  private baseUrl = "https://api.frame.io/v2"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Frame.io API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Account methods
  async getAccount(): Promise<FrameioAccount> {
    return this.request("/accounts/me")
  }

  // Team methods
  async getTeams(): Promise<FrameioTeam[]> {
    const response = await this.request("/teams")
    return response.teams || []
  }

  async getTeam(teamId: string): Promise<FrameioTeam> {
    return this.request(`/teams/${teamId}`)
  }

  // Project methods
  async getProjects(teamId?: string): Promise<FrameioProject[]> {
    const endpoint = teamId ? `/teams/${teamId}/projects` : "/projects"
    const response = await this.request(endpoint)
    return response.projects || []
  }

  async getProject(projectId: string): Promise<FrameioProject> {
    return this.request(`/projects/${projectId}`)
  }

  async createProject(data: Partial<FrameioProject>): Promise<FrameioProject> {
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProject(projectId: string, data: Partial<FrameioProject>): Promise<FrameioProject> {
    return this.request(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Asset methods
  async getAssets(parentId: string): Promise<FrameioAsset[]> {
    const response = await this.request(`/assets/${parentId}/children`)
    return response.assets || []
  }

  async getAsset(assetId: string): Promise<FrameioAsset> {
    return this.request(`/assets/${assetId}`)
  }

  async uploadAsset(parentId: string, file: File): Promise<FrameioAsset> {
    // Implementation would handle file upload
    throw new Error("Upload implementation needed")
  }

  // Comment methods
  async getComments(assetId: string): Promise<FrameioComment[]> {
    const response = await this.request(`/assets/${assetId}/comments`)
    return response.comments || []
  }

  async createComment(data: Partial<FrameioComment>): Promise<FrameioComment> {
    return this.request("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateComment(commentId: string, data: Partial<FrameioComment>): Promise<FrameioComment> {
    return this.request(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.request(`/comments/${commentId}`, {
      method: "DELETE",
    })
  }

  // v4 Reaction methods
  async addReaction(commentId: string, emoji: string): Promise<void> {
    await this.request(`/comments/${commentId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    })
  }

  async removeReaction(commentId: string, emoji: string): Promise<void> {
    await this.request(`/comments/${commentId}/reactions/${emoji}`, {
      method: "DELETE",
    })
  }

  // Analytics methods (v4)
  async getProjectAnalytics(projectId: string): Promise<any> {
    return this.request(`/projects/${projectId}/analytics`)
  }

  async getAssetAnalytics(assetId: string): Promise<any> {
    return this.request(`/assets/${assetId}/analytics`)
  }

  // Search methods
  async search(query: string, filters?: any): Promise<any> {
    const params = new URLSearchParams({ q: query, ...filters })
    return this.request(`/search?${params}`)
  }
}

// Frame.io Service - MISSING EXPORT
export class FrameioService {
  private client: FrameioClient

  constructor(apiKey: string) {
    this.client = new FrameioClient(apiKey)
  }

  // Convenience methods that wrap the client
  async getAccountInfo() {
    return this.client.getAccount()
  }

  async getAllProjects() {
    return this.client.getProjects()
  }

  async getProjectById(projectId: string) {
    return this.client.getProject(projectId)
  }

  async getProjectAssets(projectId: string) {
    return this.client.getAssets(projectId)
  }

  async getAssetComments(assetId: string) {
    return this.client.getComments(assetId)
  }

  async addCommentToAsset(assetId: string, text: string, timestamp?: number) {
    return this.client.createComment({
      asset_id: assetId,
      text,
      timestamp,
    })
  }

  async searchContent(query: string) {
    return this.client.search(query)
  }
}

// Factory function to create Frame.io service - MISSING EXPORT
export function createFrameioService(apiKey: string): FrameioService {
  return new FrameioService(apiKey)
}

// Default service instance - MISSING EXPORT
export const frameioService = new FrameioService(process.env.FRAMEIO_API_KEY || "")

// Utility functions
export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function getCommentPriorityColor(priority?: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function isFrameioUrl(url: string): boolean {
  return url.includes("frame.io") || url.includes("frameio")
}

export function extractFrameioId(url: string): string | null {
  const match = url.match(/frame\.io\/(?:projects|assets)\/([a-zA-Z0-9-]+)/)
  return match ? match[1] : null
}
