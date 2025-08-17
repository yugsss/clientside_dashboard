import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { authConfig } from "./env"
import { supabaseAdmin } from "./supabase"
import type { User } from "./supabase"

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
  role?: "client" | "employee" | "admin" | "qc"
  company?: string
  planId?: string
  planName?: string
  planPrice?: number
  planType?: "monthly" | "per-video"
  planFeatures?: string[]
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

  generateTokens(user: Omit<User, "password_hash">): AuthTokens {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      planId: user.plan_id,
    }

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: "15m",
      issuer: "editlobby",
      audience: "editlobby-users",
    })

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: "7d",
      issuer: "editlobby",
      audience: "editlobby-users",
    })

    return { accessToken, refreshToken }
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: "editlobby",
        audience: "editlobby-users",
      })
    } catch (error) {
      throw new Error("Invalid or expired token")
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: Omit<User, "password_hash">; tokens: AuthTokens }> {
    try {
      // Query user from Supabase database
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", credentials.email)
        .single()

      if (error || !user) {
        throw new Error("User not found")
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash)
      if (!isValidPassword) {
        throw new Error("Invalid password")
      }

      // Update last login
      await supabaseAdmin.from("users").update({ updated_at: new Date().toISOString() }).eq("id", user.id)

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user
      const tokens = this.generateTokens(userWithoutPassword)

      return {
        user: userWithoutPassword,
        tokens,
      }
    } catch (error) {
      console.error("Login error:", error)
      throw new Error(error instanceof Error ? error.message : "Login failed")
    }
  }

  async register(data: RegisterData): Promise<{ user: Omit<User, "password_hash">; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("email", data.email).single()

      if (existingUser) {
        throw new Error("User already exists")
      }

      const hashedPassword = await this.hashPassword(data.password)
      const now = new Date().toISOString()

      // Create new user in database
      const newUser = {
        email: data.email,
        name: data.name,
        password_hash: hashedPassword,
        role: data.role || "client",
        company: data.company || null,
        plan_id: data.planId || "basic",
        plan_name: data.planName || "Basic Plan",
        plan_price: data.planPrice || 45,
        plan_type: data.planType || "per-video",
        plan_features: data.planFeatures || [
          "One professional video edit",
          "48-hour turnaround",
          "2 rounds of revisions",
        ],
        active_projects: 0,
        max_projects: data.role === "client" ? (data.planType === "monthly" ? 10 : 1) : 999,
        total_spent: data.planPrice || 45,
        member_since: now,
        created_at: now,
        updated_at: now,
      }

      const { data: insertedUser, error } = await supabaseAdmin.from("users").insert(newUser).select("*").single()

      if (error || !insertedUser) {
        throw new Error("Failed to create user")
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = insertedUser
      const tokens = this.generateTokens(userWithoutPassword)

      return {
        user: userWithoutPassword,
        tokens,
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw new Error(error instanceof Error ? error.message : "Registration failed")
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyToken(refreshToken)

    // Get updated user data from database
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role, plan_id")
      .eq("id", payload.id)
      .single()

    if (error || !user) {
      throw new Error("User not found")
    }

    return this.generateTokens(user)
  }

  async logout(refreshToken: string): Promise<void> {
    // In a real implementation, you'd add the refresh token to a blacklist
    console.log("User logged out, refresh token invalidated:", refreshToken)
  }

  async getCurrentUser(accessToken: string): Promise<Omit<User, "password_hash">> {
    const payload = this.verifyToken(accessToken)

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*, password_hash")
      .eq("id", payload.id)
      .single()

    if (error || !user) {
      throw new Error("User not found")
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async getUsersByRole(role: "client" | "employee" | "admin" | "qc"): Promise<Omit<User, "password_hash">[]> {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("*, password_hash")
      .eq("role", role)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error("Failed to fetch users")
    }

    // Remove password hashes from response
    return users.map(({ password_hash, ...user }) => user)
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<Omit<User, "password_hash">> {
    const { password_hash, ...safeUpdates } = updates as any

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("*, password_hash")
      .single()

    if (error || !user) {
      throw new Error("Failed to update user")
    }

    const { password_hash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export const authService = new AuthService()
