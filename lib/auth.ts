import type { User } from "../types"

// Mock authentication - replace with your actual auth system
export const getCurrentUser = (): User | null => {
  // This would typically check JWT token, session, etc.
  const mockUser: User = {
    id: "1",
    email: "john@client.com",
    name: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "client",
    company: "Acme Corp",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-15T10:30:00Z",
  }
  return mockUser
}

export const hasPermission = (user: User, action: string, resource?: any): boolean => {
  switch (user.role) {
    case "admin":
      return true // Admin has all permissions

    case "employee":
      // Employees can view all projects, edit assigned ones
      if (action === "view_projects") return true
      if (action === "edit_project" && resource?.assignedEditor === user.id) return true
      if (action === "add_comments") return true
      if (action === "chat") return true
      return false

    case "client":
      // Clients can only view their own projects
      if (action === "view_projects" && resource?.clientId === user.id) return true
      if (action === "view_project" && resource?.clientId === user.id) return true
      if (action === "add_comments" && resource?.clientId === user.id) return true
      if (action === "chat") return true
      return false

    default:
      return false
  }
}
