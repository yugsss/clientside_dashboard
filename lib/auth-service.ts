import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { authConfig } from "./env"
import type { User } from "../types"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: "client" | "employee" | "admin"
  company?: string
}

export class AuthService {
  private jwtSecret: string

  constructor() {
    this.jwtSecret = authConfig.jwtSecret
    if (!this.jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required")
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  generateTokens(user: User): AuthTokens {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: "15m",
      issuer: "videoedit-pro",
      audience: "videoedit-users",
    })

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: "7d",
      issuer: "videoedit-pro",
      audience: "videoedit-users",
    })

    return { accessToken, refreshToken }
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: "videoedit-pro",
        audience: "videoedit-users",
      })
    } catch (error) {
      throw new Error("Invalid or expired token")
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Mock users for development - replace with database queries
    const mockUsers: (User & { password: string })[] = [
      {
        id: "1",
        email: "john@client.com",
        password: await this.hashPassword("password"),
        name: "John Doe",
        role: "client",
        company: "Acme Corp",
        createdAt: "2024-01-01",
        lastLogin: new Date().toISOString(),
      },
      {
        id: "2",
        email: "sarah@company.com",
        password: await this.hashPassword("password"),
        name: "Sarah Editor",
        role: "employee",
        company: "VideoEdit Pro",
        createdAt: "2024-01-01",
        lastLogin: new Date().toISOString(),
      },
      {
        id: "3",
        email: "admin@company.com",
        password: await this.hashPassword("password"),
        name: "Admin User",
        role: "admin",
        company: "VideoEdit Pro",
        createdAt: "2024-01-01",
        lastLogin: new Date().toISOString(),
      },
      {
        id: "4",
        email: "editor@company.com",
        password: await this.hashPassword("password"),
        name: "Alex Editor",
        role: "employee",
        company: "VideoEdit Pro",
        createdAt: "2024-01-01",
        lastLogin: new Date().toISOString(),
      },
      {
        id: "5",
        email: "qc@company.com",
        password: await this.hashPassword("password"),
        name: "QC Specialist",
        role: "employee",
        company: "VideoEdit Pro",
        createdAt: "2024-01-01",
        lastLogin: new Date().toISOString(),
      },
    ]

    const user = mockUsers.find((u) => u.email === credentials.email)
    if (!user) {
      throw new Error("User not found")
    }

    const isValidPassword = await this.verifyPassword(credentials.password, user.password)
    if (!isValidPassword) {
      throw new Error("Invalid password")
    }

    const { password, ...userWithoutPassword } = user
    const tokens = this.generateTokens(userWithoutPassword)

    return {
      user: userWithoutPassword,
      tokens,
    }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists (mock implementation)
    const existingUsers = ["john@client.com", "sarah@company.com", "admin@company.com"]

    if (existingUsers.includes(data.email)) {
      throw new Error("User already exists")
    }

    const hashedPassword = await this.hashPassword(data.password)

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role || "client",
      company: data.company,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    const tokens = this.generateTokens(newUser)

    return {
      user: newUser,
      tokens,
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyToken(refreshToken)

    const user: User = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      createdAt: payload.createdAt,
      lastLogin: new Date().toISOString(),
    }

    return this.generateTokens(user)
  }

  async logout(refreshToken: string): Promise<void> {
    // In a real implementation, you'd add the refresh token to a blacklist
    console.log("User logged out, refresh token invalidated:", refreshToken)
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    const payload = this.verifyToken(accessToken)

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      createdAt: payload.createdAt,
      lastLogin: new Date().toISOString(),
    }
  }
}

export const authService = new AuthService()
