import { neon } from "@neondatabase/serverless"

// Check if we have a database URL, otherwise use mock data
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_POSTGRES_URL

let sql: any = null

if (DATABASE_URL) {
  try {
    sql = neon(DATABASE_URL)
    console.log("✅ Database connection established")
  } catch (error) {
    console.warn("⚠️ Database connection failed, using mock data:", error)
    sql = null
  }
} else {
  console.warn("⚠️ No database URL found, using mock data")
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "employee" | "client"
  company?: string
  avatar?: string
  password?: string
  created_at: string
  createdAt?: string
  last_login?: string
  lastLogin?: string
}

export interface Project {
  id: string
  name: string
  title: string
  description: string
  status:
    | "active"
    | "completed"
    | "on_hold"
    | "cancelled"
    | "pending"
    | "in_progress"
    | "review"
    | "revision"
    | "delivered"
  priority: "low" | "medium" | "high" | "urgent"
  client_id: string
  clientId: string
  assigned_to?: string
  assignedTo?: string
  frameio_project_id?: string
  frameioProjectId?: string
  due_date?: string
  dueDate?: string
  created_at: string
  createdAt: string
  updated_at: string
  updatedAt: string
  progress: number
  thumbnail_url?: string
  thumbnailUrl?: string
}

export interface Comment {
  id: string
  projectId: string
  userId: string
  content: string
  type: "general" | "revision"
  timeframe?: string
  created_at: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  user_id: string
  userId: string
  user_name?: string
  user_role?: string
  message: string
  created_at: string
  createdAt: string
  project_id?: string
  projectId?: string
  reply_to?: string
}

export interface Notification {
  id: string
  user_id: string
  userId: string
  title: string
  message: string
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "project_update"
    | "comment_added"
    | "video_ready"
    | "deadline_reminder"
    | "chat_message"
  read: boolean
  created_at: string
  createdAt: string
  action_url?: string
  actionUrl?: string
  metadata?: any
}

export interface UserSettings {
  id?: string
  user_id: string
  userId?: string
  theme: string
  email_notifications: boolean
  push_notifications: boolean
  notifications_enabled?: boolean
  language: string
  timezone: string
  settings?: any
  created_at?: string
  updated_at?: string
}

// Mock data for when database is not available
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@editlobby.com",
    name: "Admin User",
    role: "admin",
    company: "Edit Lobby",
    avatar: "/images/editlobby-logo.jpg",
    created_at: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    last_login: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: "2",
    email: "editor@editlobby.com",
    name: "Sarah Editor",
    role: "employee",
    company: "Edit Lobby",
    avatar: "/images/editlobby-logo.jpg",
    created_at: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    last_login: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: "3",
    email: "client@company.com",
    name: "John Client",
    role: "client",
    company: "Acme Corp",
    avatar: "/images/editlobby-logo.jpg",
    created_at: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    last_login: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
]

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Corporate Video Campaign",
    title: "Corporate Video Campaign",
    description: "Marketing video for Q1 product launch with Frame.io integration",
    status: "active",
    priority: "high",
    client_id: "3",
    clientId: "3",
    assigned_to: "2",
    assignedTo: "2",
    frameio_project_id: "frame-project-123",
    frameioProjectId: "frame-project-123",
    due_date: "2024-02-15T00:00:00Z",
    dueDate: "2024-02-15T00:00:00Z",
    created_at: "2024-01-15T00:00:00Z",
    createdAt: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    progress: 75,
    thumbnail_url: "/placeholder.svg?height=200&width=300&text=Corporate+Video",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Corporate+Video",
  },
  {
    id: "2",
    name: "Social Media Content",
    title: "Social Media Content",
    description: "Create 10 short-form videos for social media platforms",
    status: "in_progress",
    priority: "medium",
    client_id: "3",
    clientId: "3",
    assigned_to: "2",
    assignedTo: "2",
    frameio_project_id: "frame-project-456",
    frameioProjectId: "frame-project-456",
    due_date: "2024-02-10T00:00:00Z",
    dueDate: "2024-02-10T00:00:00Z",
    created_at: "2024-01-10T00:00:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
    progress: 45,
    thumbnail_url: "/placeholder.svg?height=200&width=300&text=Social+Media",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Social+Media",
  },
  {
    id: "3",
    name: "Product Demo Series",
    title: "Product Demo Series",
    description: "5-part product demonstration video series with animations",
    status: "completed",
    priority: "medium",
    client_id: "3",
    clientId: "3",
    assigned_to: "2",
    assignedTo: "2",
    frameio_project_id: "frame-project-789",
    frameioProjectId: "frame-project-789",
    due_date: "2024-01-30T00:00:00Z",
    dueDate: "2024-01-30T00:00:00Z",
    created_at: "2024-01-05T00:00:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-25T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z",
    progress: 100,
    thumbnail_url: "/placeholder.svg?height=200&width=300&text=Product+Demo",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Product+Demo",
  },
]

const mockComments: Comment[] = [
  {
    id: "1",
    projectId: "1",
    userId: "3",
    content:
      "Please add more dynamic transitions between scenes and adjust the color grading. The Frame.io review looks great!",
    type: "revision",
    timeframe: "2 days",
    created_at: "2024-01-20T10:00:00Z",
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    projectId: "2",
    userId: "3",
    content: "The intro looks great! Can we make the logo animation a bit faster?",
    type: "general",
    created_at: "2024-01-19T14:30:00Z",
    createdAt: "2024-01-19T14:30:00Z",
  },
]

const mockChatMessages: ChatMessage[] = [
  {
    id: "1",
    user_id: "1",
    userId: "1",
    user_name: "Admin User",
    user_role: "admin",
    message: "Welcome to Edit Lobby! Frame.io integration is now live. How can we help you today?",
    created_at: "2024-01-20T10:00:00Z",
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    user_id: "3",
    userId: "3",
    user_name: "John Client",
    user_role: "client",
    message: "Hi! I'd like to discuss the timeline for my corporate video project. The Frame.io preview looks amazing!",
    created_at: "2024-01-20T10:05:00Z",
    createdAt: "2024-01-20T10:05:00Z",
  },
  {
    id: "3",
    user_id: "2",
    userId: "2",
    user_name: "Sarah Editor",
    user_role: "employee",
    message:
      "I can help with that! The current progress is looking good and we're on track for the February deadline. Frame.io collaboration is working perfectly.",
    created_at: "2024-01-20T10:10:00Z",
    createdAt: "2024-01-20T10:10:00Z",
  },
]

const mockNotifications: Notification[] = [
  {
    id: "1",
    user_id: "3",
    userId: "3",
    title: "Frame.io Project Updated",
    message: "Your corporate video project has been updated to 75% completion with new Frame.io assets",
    type: "project_update",
    read: false,
    created_at: "2024-01-20T09:00:00Z",
    createdAt: "2024-01-20T09:00:00Z",
    action_url: "/projects/1",
    actionUrl: "/projects/1",
  },
  {
    id: "2",
    user_id: "2",
    userId: "2",
    title: "New Frame.io Comment",
    message: "You have a new comment from John Client on the corporate video project",
    type: "comment_added",
    read: false,
    created_at: "2024-01-20T10:05:00Z",
    createdAt: "2024-01-20T10:05:00Z",
    action_url: "/projects/1",
    actionUrl: "/projects/1",
  },
  {
    id: "3",
    user_id: "3",
    userId: "3",
    title: "Video Ready for Review",
    message: "Your revision request has been completed and is ready for review in Frame.io",
    type: "video_ready",
    read: true,
    created_at: "2024-01-19T16:30:00Z",
    createdAt: "2024-01-19T16:30:00Z",
    action_url: "/projects/1",
    actionUrl: "/projects/1",
  },
  {
    id: "4",
    user_id: "1",
    userId: "1",
    title: "System Update",
    message: "Frame.io integration has been successfully updated with new collaboration features",
    type: "info",
    read: false,
    created_at: "2024-01-20T08:00:00Z",
    createdAt: "2024-01-20T08:00:00Z",
  },
  {
    id: "5",
    user_id: "2",
    userId: "2",
    title: "Deadline Reminder",
    message: "Social Media Content project is due in 3 days",
    type: "deadline_reminder",
    read: false,
    created_at: "2024-01-20T09:30:00Z",
    createdAt: "2024-01-20T09:30:00Z",
    action_url: "/projects/2",
    actionUrl: "/projects/2",
  },
]

const mockUserSettings: UserSettings[] = [
  {
    user_id: "1",
    userId: "1",
    theme: "dark",
    email_notifications: true,
    push_notifications: true,
    notifications_enabled: true,
    language: "en",
    timezone: "UTC",
  },
  {
    user_id: "2",
    userId: "2",
    theme: "light",
    email_notifications: true,
    push_notifications: false,
    notifications_enabled: true,
    language: "en",
    timezone: "America/Los_Angeles",
  },
  {
    user_id: "3",
    userId: "3",
    theme: "system",
    email_notifications: false,
    push_notifications: true,
    notifications_enabled: true,
    language: "es",
    timezone: "America/New_York",
  },
]

export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private async executeQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
    if (!sql) {
      console.log("📊 Using mock data (no database connection)")
      return fallback
    }

    try {
      const result = await query()
      console.log("📊 Database query successful")
      return result
    } catch (error) {
      console.error("Database query failed, using mock data:", error)
      return fallback
    }
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return this.executeQuery(async () => {
      const result = await sql`SELECT * FROM users_sync ORDER BY created_at DESC`
      return result.map((user: any) => ({
        ...user,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      })) as User[]
    }, [...mockUsers])
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.executeQuery(
      async () => {
        const result = await sql`SELECT * FROM users_sync WHERE email = ${email}`
        if (result[0]) {
          return {
            ...result[0],
            createdAt: result[0].created_at,
            lastLogin: result[0].last_login,
          } as User
        }
        return null
      },
      mockUsers.find((u) => u.email === email) || null,
    )
  }

  async getUserById(id: string): Promise<User | null> {
    return this.executeQuery(
      async () => {
        const result = await sql`SELECT * FROM users_sync WHERE id = ${id}`
        if (result[0]) {
          return {
            ...result[0],
            createdAt: result[0].created_at,
            lastLogin: result[0].last_login,
          } as User
        }
        return null
      },
      mockUsers.find((u) => u.id === id) || null,
    )
  }

  async createUser(userData: {
    name: string
    email: string
    password: string
    role: "admin" | "employee" | "client"
    company?: string
  }): Promise<string> {
    if (!sql) {
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        company: userData.company,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        last_login: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }
      mockUsers.push(newUser)
      return newUser.id
    }

    try {
      const result = await sql`
        INSERT INTO users_sync (email, name, role, company, password_hash)
        VALUES (${userData.email}, ${userData.name}, ${userData.role}, ${userData.company || null}, ${userData.password})
        RETURNING id
      `
      return result[0].id
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    if (!sql) {
      const user = mockUsers.find((u) => u.id === userId)
      if (user) {
        user.last_login = new Date().toISOString()
        user.lastLogin = new Date().toISOString()
      }
      return
    }

    try {
      await sql`UPDATE users_sync SET last_login = NOW() WHERE id = ${userId}`
    } catch (error) {
      console.error("Error updating user last login:", error)
    }
  }

  async getAllUsers(role?: string): Promise<User[]> {
    return this.executeQuery(
      async () => {
        if (role) {
          const result = await sql`SELECT * FROM users_sync WHERE role = ${role} ORDER BY created_at DESC`
          return result.map((user: any) => ({
            ...user,
            createdAt: user.created_at,
            lastLogin: user.last_login,
          })) as User[]
        } else {
          const result = await sql`SELECT * FROM users_sync ORDER BY created_at DESC`
          return result.map((user: any) => ({
            ...user,
            createdAt: user.created_at,
            lastLogin: user.last_login,
          })) as User[]
        }
      },
      role ? mockUsers.filter((user) => user.role === role) : [...mockUsers],
    )
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return this.executeQuery(async () => {
      const result = await sql`
        SELECT 
          p.*,
          u.name as assigned_user_name,
          COALESCE(p.progress, 0) as progress
        FROM projects p
        LEFT JOIN users_sync u ON p.assigned_editor = u.id
        ORDER BY p.created_at DESC
      `
      return result.map((project: any) => ({
        ...project,
        name: project.title,
        clientId: project.client_id,
        assignedTo: project.assigned_editor,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        dueDate: project.deadline,
        frameioProjectId: project.frameio_project_id,
        thumbnailUrl: project.thumbnail_url,
        progress: project.progress || Math.floor(Math.random() * 100),
      })) as Project[]
    }, [...mockProjects])
  }

  async getAllProjects(): Promise<Project[]> {
    return this.getProjects()
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.executeQuery(
      async () => {
        const result = await sql`SELECT * FROM projects WHERE id = ${id}`
        if (result[0]) {
          return {
            ...result[0],
            name: result[0].title,
            clientId: result[0].client_id,
            assignedTo: result[0].assigned_editor,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
            dueDate: result[0].deadline,
            frameioProjectId: result[0].frameio_project_id,
            thumbnailUrl: result[0].thumbnail_url,
            progress: Math.floor(Math.random() * 100),
          } as Project
        }
        return null
      },
      mockProjects.find((p) => p.id === id) || null,
    )
  }

  async getProjectsByUserId(userId: string, userRole: string): Promise<Project[]> {
    return this.executeQuery(
      async () => {
        let result
        if (userRole === "client") {
          result = await sql`
            SELECT 
              p.*,
              u.name as assigned_user_name,
              COALESCE(p.progress, 0) as progress
            FROM projects p
            LEFT JOIN users_sync u ON p.assigned_editor = u.id
            WHERE p.client_id = ${userId}
            ORDER BY p.created_at DESC
          `
        } else if (userRole === "employee") {
          result = await sql`
            SELECT 
              p.*,
              u.name as assigned_user_name,
              COALESCE(p.progress, 0) as progress
            FROM projects p
            LEFT JOIN users_sync u ON p.assigned_editor = u.id
            WHERE p.assigned_editor = ${userId}
            ORDER BY p.created_at DESC
          `
        } else {
          result = await sql`
            SELECT 
              p.*,
              u.name as assigned_user_name,
              COALESCE(p.progress, 0) as progress
            FROM projects p
            LEFT JOIN users_sync u ON p.assigned_editor = u.id
            ORDER BY p.created_at DESC
          `
        }

        return result.map((project: any) => ({
          ...project,
          name: project.title,
          clientId: project.client_id,
          assignedTo: project.assigned_editor,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          dueDate: project.deadline,
          frameioProjectId: project.frameio_project_id,
          thumbnailUrl: project.thumbnail_url,
          progress: project.progress || Math.floor(Math.random() * 100),
        })) as Project[]
      },
      userRole === "client"
        ? mockProjects.filter((p) => p.clientId === userId || p.client_id === userId)
        : userRole === "employee"
          ? mockProjects.filter((p) => p.assignedTo === userId || p.assigned_to === userId)
          : [...mockProjects],
    )
  }

  async getProjectsByAssignee(userId: string): Promise<Project[]> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          SELECT 
            p.*,
            u.name as assigned_user_name,
            COALESCE(p.progress, 0) as progress
          FROM projects p
          LEFT JOIN users_sync u ON p.assigned_editor = u.id
          WHERE p.assigned_editor = ${userId}
          ORDER BY p.created_at DESC
        `
        return result.map((project: any) => ({
          ...project,
          name: project.title,
          clientId: project.client_id,
          assignedTo: project.assigned_editor,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          dueDate: project.deadline,
          frameioProjectId: project.frameio_project_id,
          thumbnailUrl: project.thumbnail_url,
          progress: project.progress || Math.floor(Math.random() * 100),
        })) as Project[]
      },
      mockProjects.filter((p) => p.assignedTo === userId || p.assigned_to === userId),
    )
  }

  // Chat operations
  async getChatMessages(limit = 50, projectId?: string): Promise<ChatMessage[]> {
    return this.executeQuery(
      async () => {
        let result
        if (projectId) {
          result = await sql`
            SELECT 
              cm.*,
              u.name as user_name,
              u.role as user_role
            FROM chat_messages cm
            LEFT JOIN users_sync u ON cm.user_id = u.id
            WHERE cm.project_id = ${projectId}
            ORDER BY cm.created_at DESC 
            LIMIT ${limit}
          `
        } else {
          result = await sql`
            SELECT 
              cm.*,
              u.name as user_name,
              u.role as user_role
            FROM chat_messages cm
            LEFT JOIN users_sync u ON cm.user_id = u.id
            ORDER BY cm.created_at DESC 
            LIMIT ${limit}
          `
        }
        return result.map((msg: any) => ({
          ...msg,
          userId: msg.user_id,
          createdAt: msg.created_at,
          projectId: msg.project_id,
        })) as ChatMessage[]
      },
      projectId
        ? mockChatMessages.filter((msg) => msg.project_id === projectId || msg.projectId === projectId)
        : [...mockChatMessages],
    )
  }

  async addChatMessage(userId: string, message: string, projectId?: string): Promise<ChatMessage> {
    if (!sql) {
      const user = mockUsers.find((u) => u.id === userId)
      const newMessage: ChatMessage = {
        id: (mockChatMessages.length + 1).toString(),
        user_id: userId,
        userId: userId,
        user_name: user?.name || "Unknown User",
        user_role: user?.role || "client",
        message,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        project_id: projectId,
        projectId: projectId,
      }
      mockChatMessages.push(newMessage)
      return newMessage
    }

    try {
      const user = await this.getUserById(userId)
      const result = await sql`
        INSERT INTO chat_messages (project_id, user_id, message)
        VALUES (${projectId || null}, ${userId}, ${message})
        RETURNING *
      `
      const newMessage = result[0]
      return {
        ...newMessage,
        userId: newMessage.user_id,
        user_name: user?.name || "Unknown",
        user_role: user?.role || "client",
        createdAt: newMessage.created_at,
        projectId: newMessage.project_id,
      } as ChatMessage
    } catch (error) {
      console.error("Error adding chat message:", error)
      throw error
    }
  }

  // Notification operations
  async getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    return this.executeQuery(
      async () => {
        let result
        if (unreadOnly) {
          result = await sql`
            SELECT * FROM notifications 
            WHERE user_id = ${userId} AND read = false
            ORDER BY created_at DESC
          `
        } else {
          result = await sql`
            SELECT * FROM notifications 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
          `
        }
        return result.map((notif: any) => ({
          ...notif,
          userId: notif.user_id,
          createdAt: notif.created_at,
          actionUrl: notif.action_url,
        })) as Notification[]
      },
      unreadOnly
        ? mockNotifications.filter((n) => (n.userId === userId || n.user_id === userId) && !n.read)
        : mockNotifications.filter((n) => n.userId === userId || n.user_id === userId),
    )
  }

  async createNotification(notificationData: {
    userId: string
    title: string
    message: string
    type:
      | "info"
      | "success"
      | "warning"
      | "error"
      | "project_update"
      | "comment_added"
      | "video_ready"
      | "deadline_reminder"
      | "chat_message"
    actionUrl?: string
    metadata?: any
  }): Promise<string> {
    if (!sql) {
      const newNotification: Notification = {
        id: (mockNotifications.length + 1).toString(),
        user_id: notificationData.userId,
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        read: false,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        action_url: notificationData.actionUrl,
        actionUrl: notificationData.actionUrl,
        metadata: notificationData.metadata,
      }
      mockNotifications.push(newNotification)
      return newNotification.id
    }

    try {
      const result = await sql`
        INSERT INTO notifications (user_id, type, title, message, read, action_url, metadata)
        VALUES (${notificationData.userId}, ${notificationData.type}, ${notificationData.title}, ${notificationData.message}, false, ${notificationData.actionUrl || null}, ${JSON.stringify(notificationData.metadata || {})})
        RETURNING id
      `
      return result[0].id
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (!sql) {
      const notification = mockNotifications.find((n) => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
      return
    }

    try {
      await sql`UPDATE notifications SET read = true WHERE id = ${notificationId}`
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    if (!sql) {
      const index = mockNotifications.findIndex((n) => n.id === notificationId)
      if (index !== -1) {
        mockNotifications.splice(index, 1)
      }
      return
    }

    try {
      await sql`DELETE FROM notifications WHERE id = ${notificationId}`
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  // Comment operations
  async getCommentsByProjectId(projectId: string): Promise<Comment[]> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          SELECT c.*, u.name as user_name FROM comments c
          LEFT JOIN users_sync u ON c.user_id = u.id
          WHERE c.project_id = ${projectId}
          ORDER BY c.created_at DESC
        `
        return result.map((comment: any) => ({
          ...comment,
          userId: comment.user_id,
          createdAt: comment.created_at,
        })) as Comment[]
      },
      mockComments.filter((c) => c.projectId === projectId),
    )
  }

  async createComment(commentData: {
    projectId: string
    userId: string
    content: string
    type?: string
    timeframe?: string
  }): Promise<string> {
    if (!sql) {
      const user = mockUsers.find((u) => u.id === commentData.userId)
      const newComment: Comment = {
        id: (mockComments.length + 1).toString(),
        projectId: commentData.projectId,
        userId: commentData.userId,
        content: commentData.content,
        type: (commentData.type as "general" | "revision") || "general",
        timeframe: commentData.timeframe,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      mockComments.push(newComment)
      return newComment.id
    }

    try {
      const result = await sql`
        INSERT INTO comments (project_id, user_id, content, type, timeframe)
        VALUES (${commentData.projectId}, ${commentData.userId}, ${commentData.content}, ${commentData.type || "general"}, ${commentData.timeframe || null})
        RETURNING id
      `
      return result[0].id
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  }

  // Settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.executeQuery(
      async () => {
        const result = await sql`SELECT * FROM user_settings WHERE user_id = ${userId}`
        if (result[0]) {
          return {
            ...result[0],
            userId: result[0].user_id,
          } as UserSettings
        }
        return null
      },
      mockUserSettings.find((s) => s.userId === userId || s.user_id === userId) || null,
    )
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    if (!sql) {
      const userSettingsIndex = mockUserSettings.findIndex((s) => s.userId === userId || s.user_id === userId)
      if (userSettingsIndex !== -1) {
        mockUserSettings[userSettingsIndex] = {
          ...mockUserSettings[userSettingsIndex],
          ...settings,
        }
      } else {
        mockUserSettings.push({
          user_id: userId,
          userId: userId,
          theme: settings.theme || "dark",
          email_notifications: settings.email_notifications ?? true,
          push_notifications: settings.push_notifications ?? true,
          notifications_enabled: settings.notifications_enabled ?? true,
          language: settings.language || "en",
          timezone: settings.timezone || "UTC",
          settings: settings.settings,
        })
      }
      return
    }

    try {
      await sql`
        INSERT INTO user_settings (user_id, theme, email_notifications, push_notifications, notifications_enabled, language, timezone, settings)
        VALUES (${userId}, ${settings.theme || "dark"}, ${settings.email_notifications ?? true}, ${settings.push_notifications ?? true}, ${settings.notifications_enabled ?? true}, ${settings.language || "en"}, ${settings.timezone || "UTC"}, ${JSON.stringify(settings.settings || {})})
        ON CONFLICT (user_id) DO UPDATE SET
          theme = EXCLUDED.theme,
          email_notifications = EXCLUDED.email_notifications,
          push_notifications = EXCLUDED.push_notifications,
          notifications_enabled = EXCLUDED.notifications_enabled,
          language = EXCLUDED.language,
          timezone = EXCLUDED.timezone,
          settings = EXCLUDED.settings,
          updated_at = NOW()
      `
    } catch (error) {
      console.error("Error updating user settings:", error)
    }
  }

  // Mock query method for compatibility
  async query(sql: string, params?: any[]): Promise<any> {
    console.log("Mock database query:", sql, params)
    return []
  }
}

// Create and export database instance
export const database = DatabaseService.getInstance()

// Export default instance for backward compatibility
export default database
