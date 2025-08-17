"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, Edit, Trash2, Crown, Shield, User, Eye } from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  role: "client" | "employee" | "admin" | "qc"
  avatar?: string
  planName: string
  totalSpent: number
  activeProjects: number
  memberSince: string
  lastLogin: string
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUsers: UserData[] = [
        {
          id: "1",
          name: "John Client",
          email: "john@client.com",
          role: "client",
          planName: "Premium Plan",
          totalSpent: 1500,
          activeProjects: 2,
          memberSince: "2024-01-15",
          lastLogin: "2024-12-20T10:30:00Z",
        },
        {
          id: "2",
          name: "Sarah Editor",
          email: "sarah@company.com",
          role: "employee",
          planName: "N/A",
          totalSpent: 0,
          activeProjects: 5,
          memberSince: "2024-01-01",
          lastLogin: "2024-12-20T14:15:00Z",
        },
        {
          id: "3",
          name: "QC Specialist",
          email: "qc@company.com",
          role: "qc",
          planName: "N/A",
          totalSpent: 0,
          activeProjects: 3,
          memberSince: "2024-01-01",
          lastLogin: "2024-12-20T09:45:00Z",
        },
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-orange-400" />
      case "qc":
        return <Shield className="h-4 w-4 text-blue-400" />
      case "employee":
        return <Edit className="h-4 w-4 text-green-400" />
      default:
        return <User className="h-4 w-4 text-slate-400" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-orange-600/20 text-orange-300 border-orange-600/30"
      case "qc":
        return "bg-blue-600/20 text-blue-300 border-blue-600/30"
      case "employee":
        return "bg-green-600/20 text-green-300 border-green-600/30"
      default:
        return "bg-slate-600/20 text-slate-300 border-slate-600/30"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400">Manage users, roles, and permissions</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Tabs value={selectedRole} onValueChange={setSelectedRole} className="w-auto">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="client">Clients</TabsTrigger>
            <TabsTrigger value="employee">Editors</TabsTrigger>
            <TabsTrigger value="qc">QC Team</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Users List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-slate-400">Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </Badge>
                    </div>
                    <p className="text-slate-400">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                      <span>Member since {new Date(user.memberSince).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    {user.role === "client" && (
                      <>
                        <p className="text-sm font-medium text-white">{user.planName}</p>
                        <p className="text-sm text-slate-400">${user.totalSpent} spent</p>
                      </>
                    )}
                    <p className="text-sm text-slate-400">{user.activeProjects} active projects</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-600 text-red-300 bg-transparent">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
