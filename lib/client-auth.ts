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

// Mock users for development
const MOCK_USERS = [
  {
    id: "1",
    email: "john@client.com",
    password: "password",
    name: "John Doe",
    role: "client" as const,
    company: "Acme Corp",
    createdAt: "2024-01-01",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "2",
    email: "sarah@company.com",
    password: "password",
    name: "Sarah Editor",
    role: "employee" as const,
    company: "VideoEdit Pro",
    createdAt: "2024-01-01",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "3",
    email: "admin@company.com",
    password: "password",
    name: "Admin User",
    role: "admin" as const,
    company: "VideoEdit Pro",
    createdAt: "2024-01-01",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "4",
    email: "editor@company.com",
    password: "password",
    name: "Alex Editor",
    role: "employee" as const,
    company: "VideoEdit Pro",
    createdAt: "2024-01-01",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "5",
    email: "qc@company.com",
    password: "password",
    name: "QC Specialist",
    role: "employee" as const,
    company: "VideoEdit Pro",
    createdAt: "2024-01-01",
    lastLogin: new Date().toISOString(),
  },
]

export class ClientAuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = MOCK_USERS.find((u) => u.email === credentials.email && u.password === credentials.password)

    if (!user) {
      throw new Error("Invalid email or password")
    }

    const { password, ...userWithoutPassword } = user

    // Generate mock tokens
    const tokens: AuthTokens = {
      accessToken: `mock_access_token_${user.id}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${user.id}_${Date.now()}`,
    }

    return {
      user: userWithoutPassword,
      tokens,
    }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === data.email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role || "client",
      company: data.company,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    // Generate mock tokens
    const tokens: AuthTokens = {
      accessToken: `mock_access_token_${newUser.id}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${newUser.id}_${Date.now()}`,
    }

    return {
      user: newUser,
      tokens,
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Extract user ID from mock token
    const userId = refreshToken.split("_")[3]

    return {
      accessToken: `mock_access_token_${userId}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${userId}_${Date.now()}`,
    }
  }

  async logout(): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("User logged out")
  }

  verifyToken(token: string): User | null {
    try {
      // Mock token verification - extract user info from token
      const parts = token.split("_")
      if (parts.length < 4) return null

      const userId = parts[3]
      const user = MOCK_USERS.find((u) => u.id === userId)

      if (!user) return null

      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch {
      return null
    }
  }
}

export const clientAuthService = new ClientAuthService()
