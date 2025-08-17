import { type NextRequest, NextResponse } from "next/server"
import { authService } from "./auth-service"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    role: "client" | "employee" | "admin" | "qc"
    planId: string
  }
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options?: {
    roles?: ("client" | "employee" | "admin" | "qc")[]
    requirePlan?: boolean
  },
) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
      }

      const token = authHeader.substring(7)

      // Verify token and get user
      const user = await authService.getCurrentUser(token)

      // Check role permissions
      if (options?.roles && !options.roles.includes(user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      // Check plan requirements for clients
      if (options?.requirePlan && user.role === "client" && !user.plan_id) {
        return NextResponse.json({ error: "Valid subscription plan required" }, { status: 402 })
      }

      // Add user to request object
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        planId: user.plan_id,
      }

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }
  }
}

// Role-based middleware helpers
export const withClientAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { roles: ["client"], requirePlan: true })

export const withEmployeeAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { roles: ["employee", "admin"] })

export const withAdminAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { roles: ["admin"] })

export const withQCAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, { roles: ["qc", "admin"] })

export const withAnyAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => withAuth(handler)

export const authMiddleware = async (
  request: NextRequest,
  allowedRoles?: ("client" | "employee" | "admin" | "qc")[],
): Promise<{ success: boolean; user?: any; error?: string; status?: number }> => {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Authorization token required", status: 401 }
    }

    const token = authHeader.substring(7)

    // Verify token and get user
    const user = await authService.getCurrentUser(token)

    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return { success: false, error: "Insufficient permissions", status: 403 }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Invalid or expired token", status: 401 }
  }
}
