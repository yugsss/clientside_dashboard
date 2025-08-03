import { Server as SocketIOServer } from "socket.io"
import { createServer } from "http"
import { websocketConfig } from "./env"
import type { ChatMessage } from "../types"

export interface SocketUser {
  id: string
  name: string
  role: string
  projectId?: string
}

export class WebSocketService {
  private io: SocketIOServer
  private server: any
  private connectedUsers: Map<string, SocketUser> = new Map()

  constructor() {
    this.server = createServer()
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: websocketConfig.corsOrigin,
        methods: ["GET", "POST"],
      },
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id)

      socket.on("join", (userData: SocketUser) => {
        this.connectedUsers.set(socket.id, userData)

        if (userData.projectId) {
          socket.join(`project:${userData.projectId}`)
        }

        // Notify others in the project
        if (userData.projectId) {
          socket.to(`project:${userData.projectId}`).emit("user_joined", {
            userId: userData.id,
            userName: userData.name,
          })
        }

        // Send current online users
        const projectUsers = Array.from(this.connectedUsers.values()).filter(
          (user) => user.projectId === userData.projectId,
        )

        socket.emit("online_users", projectUsers)
      })

      socket.on("send_message", async (messageData: Omit<ChatMessage, "id" | "timestamp">) => {
        const user = this.connectedUsers.get(socket.id)
        if (!user) return

        const message: ChatMessage = {
          id: Date.now().toString(),
          ...messageData,
          timestamp: new Date().toISOString(),
        }

        // Save to database (you'd implement this)
        // await database.createChatMessage(message)

        // Broadcast to project room
        if (messageData.projectId) {
          this.io.to(`project:${messageData.projectId}`).emit("new_message", message)
        } else {
          // Global message
          this.io.emit("new_message", message)
        }
      })

      socket.on("typing_start", (data: { projectId?: string; userName: string }) => {
        if (data.projectId) {
          socket.to(`project:${data.projectId}`).emit("user_typing", {
            userName: data.userName,
            typing: true,
          })
        }
      })

      socket.on("typing_stop", (data: { projectId?: string; userName: string }) => {
        if (data.projectId) {
          socket.to(`project:${data.projectId}`).emit("user_typing", {
            userName: data.userName,
            typing: false,
          })
        }
      })

      socket.on("join_project", (projectId: string) => {
        const user = this.connectedUsers.get(socket.id)
        if (user) {
          // Leave previous project room
          if (user.projectId) {
            socket.leave(`project:${user.projectId}`)
          }

          // Join new project room
          socket.join(`project:${projectId}`)
          user.projectId = projectId
          this.connectedUsers.set(socket.id, user)

          // Notify others
          socket.to(`project:${projectId}`).emit("user_joined", {
            userId: user.id,
            userName: user.name,
          })
        }
      })

      socket.on("disconnect", () => {
        const user = this.connectedUsers.get(socket.id)
        if (user && user.projectId) {
          socket.to(`project:${user.projectId}`).emit("user_left", {
            userId: user.id,
            userName: user.name,
          })
        }

        this.connectedUsers.delete(socket.id)
        console.log("User disconnected:", socket.id)
      })
    })
  }

  start(port?: number) {
    const serverPort = port || websocketConfig.port
    this.server.listen(serverPort, () => {
      console.log(`WebSocket server running on port ${serverPort}`)
    })
  }

  // Utility methods for sending notifications
  notifyProject(projectId: string, event: string, data: any) {
    this.io.to(`project:${projectId}`).emit(event, data)
  }

  notifyUser(userId: string, event: string, data: any) {
    const userSocket = Array.from(this.connectedUsers.entries()).find(([_, user]) => user.id === userId)

    if (userSocket) {
      this.io.to(userSocket[0]).emit(event, data)
    }
  }

  broadcast(event: string, data: any) {
    this.io.emit(event, data)
  }
}

export const websocketService = new WebSocketService()
