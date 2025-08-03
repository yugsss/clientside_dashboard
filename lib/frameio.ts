interface FrameIOConfig {
  apiKey?: string
  baseUrl: string
  version: string
  webhookSecret?: string
}

interface FrameIOProject {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  root_asset_id: string
  team_id: string
  private: boolean
  archived: boolean
}

interface FrameIOAsset {
  id: string
  name: string
  type: "file" | "folder"
  parent_id?: string
  project_id: string
  filesize?: number
  duration?: number
  fps?: number
  resolution?: string
  thumbnail?: string
  download_url?: string
  stream_url?: string
  embed_url?: string
  created_at: string
  updated_at: string
  status?: "processing" | "ready" | "error"
  progress?: number
}

interface FrameIOComment {
  id: string
  text: string
  timestamp?: number
  asset_id: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  created_at: string
  updated_at: string
  replies?: FrameIOComment[]
  resolved?: boolean
  page?: number
  x?: number
  y?: number
}

interface FrameIOTeam {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export class FrameIOService {
  private config: FrameIOConfig
  private isInitialized = false
  private useMockData = false

  constructor() {
    this.config = {
      apiKey: "7233b6e913af4f2e8a99d3eee444f0c8",
      baseUrl: "https://api.frame.io/v4",
      version: "v4",
      webhookSecret: "p8e-Mgi7xeMg6jCCS4vPGZDa-kSBQO4JuhgB",
    }

    // Always try to use real API first with provided credentials
    console.log("🎬 Frame.io service initializing with provided API key")
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Test API connection with real credentials
      const response = await this.makeRequest("/me")
      if (response.ok) {
        console.log("✅ Frame.io service initialized successfully with real API")
        this.isInitialized = true
        this.useMockData = false
        return
      } else {
        throw new Error(`Frame.io API responded with status: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Frame.io initialization failed:", error)
      console.log("🔄 Falling back to mock data for development")
      this.useMockData = true
      this.isInitialized = true
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (this.useMockData) {
      return this.mockRequest(endpoint, options)
    }

    const url = `${this.config.baseUrl}${endpoint}`
    const headers = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    try {
      const response = await fetch(url, { ...options, headers })

      if (!response.ok) {
        console.error(`Frame.io API Error: ${response.status} ${response.statusText}`)
        // Log response body for debugging
        const errorText = await response.text()
        console.error("Error details:", errorText)
      }

      return response
    } catch (error) {
      console.error("Frame.io request failed:", error)
      throw error
    }
  }

  private async mockRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700))

    const mockData = this.getMockData(endpoint, options.method || "GET")

    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  private getMockData(endpoint: string, method: string): any {
    if (endpoint === "/me") {
      return {
        id: "mock-user-123",
        name: "Edit Lobby User",
        email: "user@editlobby.com",
        avatar: "/placeholder.svg?height=40&width=40",
      }
    }

    if (endpoint.includes("/teams")) {
      return [
        {
          id: "editlobby-team-123",
          name: "Edit Lobby Production Team",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
        },
      ]
    }

    if (endpoint.includes("/projects")) {
      if (method === "POST") {
        return {
          id: `project-${Date.now()}`,
          name: "New Video Project",
          description: "Created via Frame.io API",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          root_asset_id: `root-asset-${Date.now()}`,
          team_id: "editlobby-team-123",
          private: false,
          archived: false,
        }
      }

      return [
        {
          id: "project-corporate-campaign",
          name: "Corporate Video Campaign 2024",
          description: "Q1 marketing video series for product launch",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
          root_asset_id: "root-corporate",
          team_id: "editlobby-team-123",
          private: false,
          archived: false,
        },
        {
          id: "project-social-content",
          name: "Social Media Content Library",
          description: "Short-form videos for Instagram, TikTok, and YouTube Shorts",
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-18T14:20:00Z",
          root_asset_id: "root-social",
          team_id: "editlobby-team-123",
          private: false,
          archived: false,
        },
        {
          id: "project-product-demos",
          name: "Product Demo Series",
          description: "Comprehensive product demonstration videos",
          created_at: "2024-01-05T08:00:00Z",
          updated_at: "2024-01-25T16:45:00Z",
          root_asset_id: "root-demos",
          team_id: "editlobby-team-123",
          private: false,
          archived: false,
        },
        {
          id: "project-client-testimonials",
          name: "Client Testimonial Collection",
          description: "Customer success stories and testimonials",
          created_at: "2024-01-03T12:00:00Z",
          updated_at: "2024-01-22T10:15:00Z",
          root_asset_id: "root-testimonials",
          team_id: "editlobby-team-123",
          private: false,
          archived: false,
        },
      ]
    }

    if (endpoint.includes("/assets")) {
      return [
        {
          id: "asset-final-cut-v3",
          name: "Corporate_Campaign_Final_v3.mp4",
          type: "file",
          project_id: "project-corporate-campaign",
          filesize: 524288000,
          duration: 120.5,
          fps: 24,
          resolution: "1920x1080",
          thumbnail: "/placeholder.svg?height=180&width=320&text=Corporate+Campaign+Final",
          download_url: "https://cdn.frame.io/corporate-campaign-final-v3.mp4",
          stream_url: "https://stream.frame.io/corporate-campaign-final-v3.m3u8",
          embed_url: "https://app.frame.io/embed/asset-final-cut-v3",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
          status: "ready",
          progress: 100,
        },
        {
          id: "asset-rough-cut-v1",
          name: "Corporate_Campaign_Rough_v1.mp4",
          type: "file",
          project_id: "project-corporate-campaign",
          filesize: 445644800,
          duration: 95.2,
          fps: 24,
          resolution: "1920x1080",
          thumbnail: "/placeholder.svg?height=180&width=320&text=Corporate+Rough+Cut",
          download_url: "https://cdn.frame.io/corporate-campaign-rough-v1.mp4",
          stream_url: "https://stream.frame.io/corporate-campaign-rough-v1.m3u8",
          embed_url: "https://app.frame.io/embed/asset-rough-cut-v1",
          created_at: "2024-01-12T14:00:00Z",
          updated_at: "2024-01-15T11:30:00Z",
          status: "ready",
          progress: 100,
        },
        {
          id: "asset-social-batch-1",
          name: "Social_Media_Batch_1_Instagram.mp4",
          type: "file",
          project_id: "project-social-content",
          filesize: 156789000,
          duration: 30.0,
          fps: 30,
          resolution: "1080x1920",
          thumbnail: "/placeholder.svg?height=320&width=180&text=Instagram+Stories",
          download_url: "https://cdn.frame.io/social-media-batch-1.mp4",
          stream_url: "https://stream.frame.io/social-media-batch-1.m3u8",
          embed_url: "https://app.frame.io/embed/asset-social-batch-1",
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-18T14:20:00Z",
          status: "processing",
          progress: 85,
        },
        {
          id: "asset-product-demo-1",
          name: "Product_Demo_Feature_Overview.mp4",
          type: "file",
          project_id: "project-product-demos",
          filesize: 298765432,
          duration: 180.0,
          fps: 24,
          resolution: "1920x1080",
          thumbnail: "/placeholder.svg?height=180&width=320&text=Product+Demo",
          download_url: "https://cdn.frame.io/product-demo-feature-overview.mp4",
          stream_url: "https://stream.frame.io/product-demo-feature-overview.m3u8",
          embed_url: "https://app.frame.io/embed/asset-product-demo-1",
          created_at: "2024-01-05T08:00:00Z",
          updated_at: "2024-01-25T16:45:00Z",
          status: "ready",
          progress: 100,
        },
      ]
    }

    if (endpoint.includes("/comments")) {
      if (method === "POST") {
        return {
          id: `comment-${Date.now()}`,
          text: "New comment added via Frame.io API",
          timestamp: 45.2,
          asset_id: "asset-final-cut-v3",
          author: {
            id: "user-editlobby-123",
            name: "Edit Lobby User",
            email: "user@editlobby.com",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resolved: false,
          replies: [],
        }
      }

      return [
        {
          id: "comment-transition-feedback",
          text: "The transition at 0:45 needs to be smoother. Can we add a cross-fade here? The current cut feels too abrupt for the brand tone we're going for.",
          timestamp: 45.2,
          asset_id: "asset-final-cut-v3",
          author: {
            id: "user-sarah-director",
            name: "Sarah Chen",
            email: "sarah.chen@client.com",
            avatar: "/placeholder.svg?height=32&width=32&text=SC",
          },
          created_at: "2024-01-16T10:30:00Z",
          updated_at: "2024-01-16T10:30:00Z",
          resolved: false,
          replies: [],
        },
        {
          id: "comment-color-grading",
          text: "Love the color grading in this section! The mood is perfect and really captures the premium feel we discussed. Great work on the skin tones too.",
          timestamp: 78.5,
          asset_id: "asset-final-cut-v3",
          author: {
            id: "user-mike-producer",
            name: "Mike Rodriguez",
            email: "mike.rodriguez@client.com",
            avatar: "/placeholder.svg?height=32&width=32&text=MR",
          },
          created_at: "2024-01-17T14:15:00Z",
          updated_at: "2024-01-17T14:15:00Z",
          resolved: false,
          replies: [
            {
              id: "reply-color-thanks",
              text: "Thanks Mike! Used DaVinci Resolve for the grade. Took about 3 hours to get the look just right. Really happy with how the sunset shots turned out.",
              timestamp: 78.5,
              asset_id: "asset-final-cut-v3",
              author: {
                id: "user-alex-editor",
                name: "Alex Thompson",
                email: "alex@editlobby.com",
                avatar: "/placeholder.svg?height=32&width=32&text=AT",
              },
              created_at: "2024-01-17T15:00:00Z",
              updated_at: "2024-01-17T15:00:00Z",
              resolved: false,
            },
          ],
        },
        {
          id: "comment-audio-levels",
          text: "Audio levels seem a bit low here. Can we boost the dialogue by about 3dB? Also, the background music might be competing with the voiceover.",
          timestamp: 102.8,
          asset_id: "asset-final-cut-v3",
          author: {
            id: "user-emma-sound",
            name: "Emma Wilson",
            email: "emma@editlobby.com",
            avatar: "/placeholder.svg?height=32&width=32&text=EW",
          },
          created_at: "2024-01-18T09:45:00Z",
          updated_at: "2024-01-18T09:45:00Z",
          resolved: true,
          replies: [],
        },
        {
          id: "comment-logo-placement",
          text: "The logo placement looks great, but can we make it 10% larger? It needs to be more prominent for brand recognition, especially on mobile viewing.",
          timestamp: 115.3,
          asset_id: "asset-final-cut-v3",
          author: {
            id: "user-brand-manager",
            name: "Jessica Park",
            email: "jessica.park@client.com",
            avatar: "/placeholder.svg?height=32&width=32&text=JP",
          },
          created_at: "2024-01-19T11:20:00Z",
          updated_at: "2024-01-19T11:20:00Z",
          resolved: false,
          replies: [],
        },
      ]
    }

    return { message: "Mock endpoint not implemented", endpoint, method }
  }

  // Team operations
  async getTeams(): Promise<FrameIOTeam[]> {
    await this.initialize()
    const response = await this.makeRequest("/teams")
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  // Project operations
  async getProjects(teamId?: string): Promise<FrameIOProject[]> {
    await this.initialize()
    const endpoint = teamId ? `/teams/${teamId}/projects` : "/projects"
    const response = await this.makeRequest(endpoint)
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  async getProject(projectId: string): Promise<FrameIOProject> {
    await this.initialize()
    const response = await this.makeRequest(`/projects/${projectId}`)
    return response.json()
  }

  async createProject(teamId: string, name: string, description?: string): Promise<FrameIOProject> {
    await this.initialize()
    const response = await this.makeRequest(`/teams/${teamId}/projects`, {
      method: "POST",
      body: JSON.stringify({ name, description, private: false }),
    })
    return response.json()
  }

  async updateProject(projectId: string, updates: Partial<FrameIOProject>): Promise<FrameIOProject> {
    await this.initialize()
    const response = await this.makeRequest(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    return response.json()
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.initialize()
    await this.makeRequest(`/projects/${projectId}`, {
      method: "DELETE",
    })
  }

  // Asset operations
  async getAssets(projectId: string, parentId?: string): Promise<FrameIOAsset[]> {
    await this.initialize()
    const endpoint = parentId ? `/assets/${parentId}/children` : `/projects/${projectId}/assets`
    const response = await this.makeRequest(endpoint)
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  async getAsset(assetId: string): Promise<FrameIOAsset> {
    await this.initialize()
    const response = await this.makeRequest(`/assets/${assetId}`)
    return response.json()
  }

  async uploadAsset(parentId: string, file: File, onProgress?: (progress: number) => void): Promise<FrameIOAsset> {
    await this.initialize()

    if (this.useMockData) {
      // Simulate upload progress
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          onProgress(i)
        }
      }

      return {
        id: `asset-${Date.now()}`,
        name: file.name,
        type: "file",
        parent_id: parentId,
        project_id: parentId,
        filesize: file.size,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "processing",
        progress: 0,
      }
    }

    // Real upload implementation
    const formData = new FormData()
    formData.append("file", file)
    formData.append("parent_id", parentId)

    const response = await this.makeRequest("/assets", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
    return response.json()
  }

  async deleteAsset(assetId: string): Promise<void> {
    await this.initialize()
    await this.makeRequest(`/assets/${assetId}`, {
      method: "DELETE",
    })
  }

  // Comment operations
  async getComments(assetId: string): Promise<FrameIOComment[]> {
    await this.initialize()
    const response = await this.makeRequest(`/assets/${assetId}/comments`)
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  async createComment(
    assetId: string,
    text: string,
    timestamp?: number,
    x?: number,
    y?: number,
    page?: number,
  ): Promise<FrameIOComment> {
    await this.initialize()
    const response = await this.makeRequest(`/assets/${assetId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, timestamp, x, y, page }),
    })
    return response.json()
  }

  async updateComment(commentId: string, text: string): Promise<FrameIOComment> {
    await this.initialize()
    const response = await this.makeRequest(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ text }),
    })
    return response.json()
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.initialize()
    await this.makeRequest(`/comments/${commentId}`, {
      method: "DELETE",
    })
  }

  async resolveComment(commentId: string): Promise<FrameIOComment> {
    await this.initialize()
    const response = await this.makeRequest(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ resolved: true }),
    })
    return response.json()
  }

  // Utility methods
  async getEmbedUrl(assetId: string): Promise<string> {
    await this.initialize()

    if (this.useMockData) {
      return `https://app.frame.io/embed/${assetId}`
    }

    const response = await this.makeRequest(`/assets/${assetId}`)
    const data = await response.json()
    return data.embed_url || `https://app.frame.io/embed/${assetId}`
  }

  async getDownloadUrl(assetId: string): Promise<string> {
    await this.initialize()

    if (this.useMockData) {
      return `https://cdn.frame.io/download/${assetId}`
    }

    const response = await this.makeRequest(`/assets/${assetId}/download`)
    const data = await response.json()
    return data.download_url
  }

  // Webhook verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn("No webhook secret configured")
      return true // Allow in development
    }

    const crypto = require("crypto")
    const expectedSignature = crypto.createHmac("sha256", this.config.webhookSecret).update(payload).digest("hex")

    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  }

  isUsingMockData(): boolean {
    return this.useMockData
  }

  getConfig(): FrameIOConfig {
    return { ...this.config }
  }
}

export const frameioService = new FrameIOService()
