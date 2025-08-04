interface FrameioConfig {
  apiKey: string
  baseUrl: string
}

interface FrameioProject {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface FrameioAsset {
  id: string
  name: string
  type: string
  filesize: number
  duration?: number
  created_at: string
  updated_at: string
}

interface FrameioComment {
  id: string
  text: string
  timestamp?: number
  author: {
    id: string
    name: string
    email: string
  }
  created_at: string
  updated_at: string
}

class FrameioService {
  private config: FrameioConfig

  constructor(config: FrameioConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}${endpoint}`
    const headers = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Frame.io API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getProjects(): Promise<FrameioProject[]> {
    return this.makeRequest("/projects")
  }

  async getProject(projectId: string): Promise<FrameioProject> {
    return this.makeRequest(`/projects/${projectId}`)
  }

  async createProject(name: string, description?: string): Promise<FrameioProject> {
    return this.makeRequest("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
  }

  async getAssets(projectId: string): Promise<FrameioAsset[]> {
    return this.makeRequest(`/projects/${projectId}/assets`)
  }

  async getAsset(assetId: string): Promise<FrameioAsset> {
    return this.makeRequest(`/assets/${assetId}`)
  }

  async uploadAsset(projectId: string, file: File): Promise<FrameioAsset> {
    const formData = new FormData()
    formData.append("file", file)

    return this.makeRequest(`/projects/${projectId}/assets`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        // Don't set Content-Type for FormData
      },
    })
  }

  async getComments(assetId: string): Promise<FrameioComment[]> {
    return this.makeRequest(`/assets/${assetId}/comments`)
  }

  async createComment(assetId: string, text: string, timestamp?: number): Promise<FrameioComment> {
    return this.makeRequest(`/assets/${assetId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, timestamp }),
    })
  }

  async updateComment(commentId: string, text: string): Promise<FrameioComment> {
    return this.makeRequest(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ text }),
    })
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.makeRequest(`/comments/${commentId}`, {
      method: "DELETE",
    })
  }

  async addReaction(commentId: string, emoji: string): Promise<void> {
    await this.makeRequest(`/comments/${commentId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    })
  }

  async removeReaction(commentId: string, emoji: string): Promise<void> {
    await this.makeRequest(`/comments/${commentId}/reactions/${emoji}`, {
      method: "DELETE",
    })
  }

  async search(query: string, projectId?: string): Promise<any> {
    const params = new URLSearchParams({ q: query })
    if (projectId) {
      params.append("project_id", projectId)
    }

    return this.makeRequest(`/search?${params.toString()}`)
  }

  async getProjectAnalytics(projectId: string): Promise<any> {
    return this.makeRequest(`/projects/${projectId}/analytics`)
  }
}

export function createFrameioService(): FrameioService {
  const config: FrameioConfig = {
    apiKey: process.env.FRAMEIO_API_KEY || "",
    baseUrl: process.env.FRAMEIO_API_URL || "https://api.frame.io/v2",
  }

  return new FrameioService(config)
}

export const frameioService = createFrameioService()

export type { FrameioProject, FrameioAsset, FrameioComment }
