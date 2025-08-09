"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Video, Clock, CheckCircle, AlertTriangle, Users, UserPlus, Edit, Trash2, Send, Bell, Settings, Eye, EyeOff } from 'lucide-react'

interface Project {
  id: string
  title: string
  client: string
  status: "pending" | "assigned" | "in_progress" | "qc_review" | "client_review" | "completed"
  priority: "urgent" | "high" | "medium" | "low"
  progress: number
  assignedEditor?: string
  assignedEditorId?: string
  assignedQC?: string
  assignedQCId?: string
  dueDate: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'employee' | 'qc'
  avatar: string
  active_projects: number
  is_active: boolean
  created_at: string
  last_login?: string
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Corporate Training Video",
    client: "Acme Corp",
    status: "pending",
    priority: "urgent",
    progress: 0,
    dueDate: "2024-01-20",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Product Launch Promo",
    client: "TechStart Inc",
    status: "in_progress",
    priority: "high",
    progress: 65,
    assignedEditor: "John Smith",
    assignedEditorId: "john-smith",
    assignedQC: "Sarah Wilson",
    assignedQCId: "sarah-wilson",
    dueDate: "2024-01-25",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    title: "Event Highlights Reel",
    client: "EventCo",
    status: "qc_review",
    priority: "medium",
    progress: 100,
    assignedEditor: "Mike Johnson",
    assignedEditorId: "mike-johnson",
    assignedQC: "Sarah Wilson",
    assignedQCId: "sarah-wilson",
    dueDate: "2024-01-18",
    createdAt: "2024-01-08",
  },
]

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [editors, setEditors] = useState<User[]>([])
  const [qcPersonnel, setQCPersonnel] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, { editorId?: string; qcId?: string }>>({})
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const { toast } = useToast()

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as "employee" | "qc"
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (data.success) {
        setEditors(data.users.editors)
        setQCPersonnel(data.users.qc)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentChange = (projectId: string, type: 'editor' | 'qc', userId: string) => {
    setSelectedAssignments(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [type === 'editor' ? 'editorId' : 'qcId']: userId
      }
    }))
  }

  const handleSendAssignment = async (projectId: string) => {
    const assignment = selectedAssignments[projectId]
    if (!assignment?.editorId && !assignment?.qcId) {
      toast({
        title: "Error",
        description: "Please select at least one assignee",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/projects/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          editorId: assignment.editorId,
          qcId: assignment.qcId
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setProjects(prev => prev.map(project => {
          if (project.id === projectId) {
            const editor = editors.find(e => e.id === assignment.editorId)
            const qc = qcPersonnel.find(q => q.id === assignment.qcId)
            
            return {
              ...project,
              status: "assigned" as const,
              assignedEditor: editor?.name,
              assignedEditorId: editor?.id,
              assignedQC: qc?.name,
              assignedQCId: qc?.id
            }
          }
          return project
        }))

        // Clear selection
        setSelectedAssignments(prev => {
          const newState = { ...prev }
          delete newState[projectId]
          return newState
        })

        toast({
          title: "Success",
          description: "Project assigned successfully"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to assign project:", error)
      toast({
        title: "Error",
        description: "Failed to assign project",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User created successfully"
        })
        setShowCreateUser(false)
        setNewUser({ name: "", email: "", password: "", role: "employee" })
        loadUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to create user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User updated successfully"
        })
        setEditingUser(null)
        loadUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        })
        loadUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "assigned":
        return "bg-blue-500"
      case "in_progress":
        return "bg-purple-500"
      case "qc_review":
        return "bg-orange-500"
      case "client_review":
        return "bg-indigo-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const stats = {
    total: projects.length,
    active: projects.filter((p) => ["assigned", "in_progress", "qc_review"].includes(p.status)).length,
    completed: projects.filter((p) => p.status === "completed").length,
    pending: projects.filter((p) => p.status === "pending").length,
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-10 w-10 rounded object-cover" />
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage projects, users, and system settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("notifications")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("settings")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger
            value="projects"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Video className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Users className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Projects</CardTitle>
                <Video className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Projects</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Pending Assignment</CardTitle>
                <AlertTriangle className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              </CardContent>
            </Card>
          </div>

          {/* Team Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Editor Workload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editors.map((editor) => (
                  <div key={editor.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200">{editor.name}</span>
                      <span className="text-slate-400">{editor.active_projects} projects</span>
                    </div>
                    <Progress value={(editor.active_projects / 5) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">QC Reviewer Workload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qcPersonnel.map((qc) => (
                  <div key={qc.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200">{qc.name}</span>
                      <span className="text-slate-400">{qc.active_projects} projects</span>
                    </div>
                    <Progress value={(qc.active_projects / 5) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-white">{project.title}</h3>
                        <p className="text-sm text-slate-400">Client: {project.client}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getPriorityColor(project.priority)} text-white`}>{project.priority}</Badge>
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Assign Editor</label>
                        <Select 
                          onValueChange={(value) => handleAssignmentChange(project.id, 'editor', value)}
                          value={selectedAssignments[project.id]?.editorId || project.assignedEditorId || ""}
                        >
                          <SelectTrigger className="bg-slate-600 border-slate-500">
                            <SelectValue placeholder={project.assignedEditor || "Select Editor"} />
                          </SelectTrigger>
                          <SelectContent>
                            {editors.map((editor) => (
                              <SelectItem key={editor.id} value={editor.id}>
                                {editor.name} ({editor.active_projects} projects)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Assign QC</label>
                        <Select 
                          onValueChange={(value) => handleAssignmentChange(project.id, 'qc', value)}
                          value={selectedAssignments[project.id]?.qcId || project.assignedQCId || ""}
                        >
                          <SelectTrigger className="bg-slate-600 border-slate-500">
                            <SelectValue placeholder={project.assignedQC || "Select QC"} />
                          </SelectTrigger>
                          <SelectContent>
                            {qcPersonnel.map((qc) => (
                              <SelectItem key={qc.id} value={qc.id}>
                                {qc.name} ({qc.active_projects} projects)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Progress</label>
                        <div className="space-y-1">
                          <Progress value={project.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{project.progress}%</span>
                            <span>Due: {project.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Actions</label>
                        <Button
                          onClick={() => handleSendAssignment(project.id)}
                          disabled={loading || (!selectedAssignments[project.id]?.editorId && !selectedAssignments[project.id]?.qcId)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Assignment
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white pr-10"
                        placeholder="Enter password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-300">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: "employee" | "qc") => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Editor</SelectItem>
                        <SelectItem value="qc">QC Reviewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateUser(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateUser}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Editors Table */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Editors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {editors.map((editor) => (
                  <div key={editor.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={editor.avatar || "/placeholder.svg"}
                        alt={editor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-white">{editor.name}</h3>
                        <p className="text-sm text-slate-400">{editor.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={editor.is_active ? "default" : "secondary"}>
                            {editor.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {editor.active_projects} active projects
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(editor)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Are you sure you want to delete {editor.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(editor.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* QC Personnel Table */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">QC Personnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qcPersonnel.map((qc) => (
                  <div key={qc.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={qc.avatar || "/placeholder.svg"}
                        alt={qc.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-white">{qc.name}</h3>
                        <p className="text-sm text-slate-400">{qc.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={qc.is_active ? "default" : "secondary"}>
                            {qc.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {qc.active_projects} active projects
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(qc)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Are you sure you want to delete {qc.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(qc.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">System Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                <p className="text-slate-400">All system notifications will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Settings</h3>
                <p className="text-slate-400">System configuration options will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-slate-300">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-slate-300">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateUser(editingUser.id, { name: editingUser.name, email: editingUser.email })}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Update User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
