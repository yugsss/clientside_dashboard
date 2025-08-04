import type { User, Project, Notification, VideoComment, Settings } from "../types"

export class DatabaseService {
  private static instance: DatabaseService
  private connectionString: string
  private users: Map<string, User> = new Map()
  private projects: Map<string, Project> = new Map()
  private notifications: Map<string, Notification[]> = new Map()
  private comments: Map<string, VideoComment[]> = new Map()
  private userSettings: Map<string, Settings> = new Map()
  private connected = false

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.DATABASE_URL || ""
    this.initializeMockData()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private initializeMockData() {
    console.log("Initializing mock database data...")

    // Initialize default settings for users
    this.userSettings.set("sarah-johnson", {
      notifications: {
        email: true,
        push: true,
        comments: true,
        projectUpdates: true,
        billing: false,
      },
      privacy: {
        profileVisible: true,
        activityVisible: false,
      },
      preferences: {
        theme: "dark",
        language: "en",
        timezone: "UTC",
      },
    })

    this.userSettings.set("mike-chen", {
      notifications: {
        email: false,
        push: true,
        comments: true,
        projectUpdates: false,
        billing: true,
      },
      privacy: {
        profileVisible: false,
        activityVisible: true,
      },
      preferences: {
        theme: "light",
        language: "en",
        timezone: "PST",
      },
    })

    console.log("Mock data initialized. Settings for users:", Array.from(this.userSettings.keys()))
  }

  async connect(): Promise<boolean> {
    try {
      if (this.connected) {
        return true
      }

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 50))
      this.connected = true
      console.log("Database connected successfully")
      return true
    } catch (error) {
      console.error("Database connection failed:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    console.log("Database disconnected")
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.connected) {
      await this.connect()
    }
    console.log("Executing query:", sql, params)
    await new Promise((resolve) => setTimeout(resolve, 10))
    return []
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    const user = this.users.get(id)
    console.log(`getUserById(${id}):`, user ? "found" : "not found")
    return user || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    for (const user of this.users.values()) {
      if (user.email === email) {
        console.log(`getUserByEmail(${email}): found user ${user.id}`)
        return user
      }
    }
    console.log(`getUserByEmail(${email}): not found`)
    return null
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    const user: User = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      avatar: userData.avatar || "",
      role: userData.role || "client",
      company: userData.company || "",
      plan: userData.plan || {
        id: "basic",
        name: "Basic Plan",
        price: 99,
        type: "per_video",
        features: [],
        projectLimit: 3,
        projectsUsed: 0,
        activeProjects: 0,
        canRequestNewProject: true,
        maxRevisions: 2,
      },
      projects: [],
      totalSpent: 0,
      memberSince: new Date().toISOString(),
      memberDays: 0,
    }

    this.users.set(user.id, user)
    console.log(`createUser: created user ${user.id}`)
    return user
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 75))
    const existingUser = this.users.get(id)
    if (!existingUser) {
      console.log(`updateUser(${id}): user not found`)
      return null
    }

    const updatedUser = { ...existingUser, ...userData }
    this.users.set(id, updatedUser)
    console.log(`updateUser(${id}): updated successfully`)
    return updatedUser
  }

  async getUserSettings(userId: string): Promise<Settings | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    const settings = this.userSettings.get(userId)
    console.log(`getUserSettings(${userId}):`, settings ? "found" : "not found")
    return settings || null
  }

  async updateUserSettings(userId: string, updates: Partial<Settings>): Promise<Settings | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))

    console.log(`updateUserSettings(${userId}): updating with`, updates)

    const existingSettings = this.userSettings.get(userId) || {
      notifications: {
        email: true,
        push: true,
        comments: true,
        projectUpdates: true,
        billing: false,
      },
      privacy: {
        profileVisible: true,
        activityVisible: false,
      },
      preferences: {
        theme: "dark",
        language: "en",
        timezone: "UTC",
      },
    }

    const updatedSettings: Settings = {
      notifications: { ...existingSettings.notifications, ...(updates.notifications || {}) },
      privacy: { ...existingSettings.privacy, ...(updates.privacy || {}) },
      preferences: { ...existingSettings.preferences, ...(updates.preferences || {}) },
    }

    this.userSettings.set(userId, updatedSettings)
    console.log(`updateUserSettings(${userId}): updated successfully`, updatedSettings)
    return updatedSettings
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    const projects = Array.from(this.projects.values()).filter((project) => project.clientId === userId)
    console.log(`getProjectsByUserId(${userId}): found ${projects.length} projects`)
    return projects
  }

  async createProject(projectData: Partial<Project>): Promise<Project | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    const project: Project = {
      id: projectData.id || `proj-${Date.now()}`,
      title: projectData.title || "",
      name: projectData.name || projectData.title || "",
      description: projectData.description || "",
      status: projectData.status || "pending",
      priority: projectData.priority || "medium",
      progress: projectData.progress || 0,
      clientId: projectData.clientId || "",
      videoUrl: projectData.videoUrl || "",
      thumbnailUrl: projectData.thumbnailUrl || "",
      duration: projectData.duration || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisions: 0,
      maxRevisions: projectData.maxRevisions || 2,
      canApprove: false,
      canRequestRevision: false,
    }

    this.projects.set(project.id, project)
    console.log(`createProject: created project ${project.id}`)
    return project
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 75))
    const existingProject = this.projects.get(id)
    if (!existingProject) {
      console.log(`updateProject(${id}): project not found`)
      return null
    }

    const updatedProject = {
      ...existingProject,
      ...projectData,
      updatedAt: new Date().toISOString(),
    }
    this.projects.set(id, updatedProject)
    console.log(`updateProject(${id}): updated successfully`)
    return updatedProject
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    const notifications = this.notifications.get(userId) || []
    console.log(`getNotificationsByUserId(${userId}): found ${notifications.length} notifications`)
    return notifications
  }

  async createNotification(notificationData: Partial<Notification>): Promise<Notification | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    const notification: Notification = {
      id: notificationData.id || `notif-${Date.now()}`,
      userId: notificationData.userId || "",
      title: notificationData.title || "",
      message: notificationData.message || "",
      type: notificationData.type || "system",
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: notificationData.actionUrl,
    }

    const userNotifications = this.notifications.get(notification.userId) || []
    userNotifications.push(notification)
    this.notifications.set(notification.userId, userNotifications)
    console.log(`createNotification: created notification ${notification.id} for user ${notification.userId}`)
    return notification
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    for (const [userId, notifications] of this.notifications.entries()) {
      const notification = notifications.find((n) => n.id === id)
      if (notification) {
        notification.read = true
        console.log(`markNotificationAsRead(${id}): marked as read`)
        return true
      }
    }
    console.log(`markNotificationAsRead(${id}): notification not found`)
    return false
  }

  async getCommentsByProjectId(projectId: string): Promise<VideoComment[]> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    const comments = this.comments.get(projectId) || []
    console.log(`getCommentsByProjectId(${projectId}): found ${comments.length} comments`)
    return comments
  }

  async createComment(commentData: Partial<VideoComment>): Promise<VideoComment | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 75))
    const comment: VideoComment = {
      id: commentData.id || `comment-${Date.now()}`,
      projectId: commentData.projectId || "",
      videoId: commentData.videoId || "",
      userId: commentData.userId || "",
      userName: commentData.userName || "",
      userRole: commentData.userRole || "",
      userAvatar: commentData.userAvatar || "",
      content: commentData.content || "",
      startTime: commentData.startTime || 0,
      endTime: commentData.endTime,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolved: false,
      replies: [],
      type: commentData.type || "general",
      priority: commentData.priority || "medium",
    }

    const projectComments = this.comments.get(comment.projectId) || []
    projectComments.push(comment)
    this.comments.set(comment.projectId, projectComments)
    console.log(`createComment: created comment ${comment.id} for project ${comment.projectId}`)
    return comment
  }

  async updateComment(id: string, commentData: Partial<VideoComment>): Promise<VideoComment | null> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    for (const [projectId, comments] of this.comments.entries()) {
      const commentIndex = comments.findIndex((c) => c.id === id)
      if (commentIndex !== -1) {
        comments[commentIndex] = {
          ...comments[commentIndex],
          ...commentData,
          updatedAt: new Date().toISOString(),
        }
        console.log(`updateComment(${id}): updated successfully`)
        return comments[commentIndex]
      }
    }
    console.log(`updateComment(${id}): comment not found`)
    return null
  }

  async deleteComment(id: string): Promise<boolean> {
    if (!this.connected) {
      await this.connect()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
    for (const [projectId, comments] of this.comments.entries()) {
      const commentIndex = comments.findIndex((c) => c.id === id)
      if (commentIndex !== -1) {
        comments.splice(commentIndex, 1)
        console.log(`deleteComment(${id}): deleted successfully`)
        return true
      }
    }
    console.log(`deleteComment(${id}): comment not found`)
    return false
  }
}

export const db = DatabaseService.getInstance()
