"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, FileText, TrendingUp, Calendar, CheckCircle, AlertCircle, Play, User, Building2 } from "lucide-react"
import { useAuthStore, usePermissions } from "../../stores/auth-store"
import { DatabaseService } from "../../lib/database"

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  workload: number
  activeProjects: number
  status: "available" | "busy" | "offline"
}

interface WorkloadData {
  name: string
  projects: number
  hours: number
}

interface ProjectStatusData {
  name: string
  value: number
  color: string
}

export function InternalDashboard() {
  const { user } = useAuthStore()
  const { canAccessInternalDashboard } = usePermissions()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([])
  const [projectStatusData, setProjectStatusData] = useState<ProjectStatusData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (canAccessInternalDashboard()) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const db = DatabaseService.getInstance()

      // Load projects
      const projectData = await db.getProjects()
      setProjects(projectData)

      // Load team members (mock data for now)
      const mockTeamMembers: TeamMember[] = [
        {
          id: "1",
          name: "Admin User",
          role: "admin",
          workload: 85,
          activeProjects: 3,
          status: "available",
        },
        {
          id: "2",
          name: "Sarah Editor",
          role: "employee",
          workload: 92,
          activeProjects: 4,
          status: "busy",
        },
        {
          id: "3",
          name: "Mike Editor",
          role: "employee",
          workload: 67,
          activeProjects: 2,
          status: "available",
        },
        {
          id: "4",
          name: "Lisa QC",
          role: "employee",
          workload: 78,
          activeProjects: 3,
          status: "available",
        },
      ]
      setTeamMembers(mockTeamMembers)

      // Generate workload data
      const workload: WorkloadData[] = mockTeamMembers.map((member) => ({
        name: member.name.split(" ")[0],
        projects: member.activeProjects,
        hours: Math.floor(member.workload * 0.4), // Convert percentage to hours
      }))
      setWorkloadData(workload)

      // Generate project status data
      const statusCounts = {
        active: projectData.filter((p) => p.status === "active").length,
        completed: projectData.filter((p) => p.status === "completed").length,
        on_hold: projectData.filter((p) => p.status === "on_hold").length,
        cancelled: projectData.filter((p) => p.status === "cancelled").length,
      }

      const statusData: ProjectStatusData[] = [
        { name: "Active", value: statusCounts.active, color: "#10b981" },
        { name: "Completed", value: statusCounts.completed, color: "#3b82f6" },
        { name: "On Hold", value: statusCounts.on_hold, color: "#f59e0b" },
        { name: "Cancelled", value: statusCounts.cancelled, color: "#ef4444" },
      ]
      setProjectStatusData(statusData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-red-100 text-red-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return "text-red-600"
    if (workload >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  if (!canAccessInternalDashboard()) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access the internal dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internal Dashboard</h1>
          <p className="text-gray-600 mt-1">Team workload and project management overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projects.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter((m) => m.status === "available").length} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(teamMembers.reduce((acc, m) => acc + m.workload, 0) / teamMembers.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Team capacity utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter((p) => p.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Projects delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="workload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workload">Team Workload</TabsTrigger>
          <TabsTrigger value="projects">Project Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Team Workload Tab */}
        <TabsContent value="workload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Status</CardTitle>
                <CardDescription>Current workload and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                          <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getWorkloadColor(member.workload)}`}>
                        {member.workload}%
                      </div>
                      <div className="text-xs text-gray-500">{member.activeProjects} projects</div>
                      <Progress value={member.workload} className="w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Workload Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
                <CardDescription>Projects and hours per team member</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                    <Bar dataKey="hours" fill="#10b981" name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Project Status Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Overview of all project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Latest project updates and status changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{project.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge
                          className={
                            project.status === "active"
                              ? "bg-green-100 text-green-800"
                              : project.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {project.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Progress value={project.progress} className="w-16" />
                      <div className="text-xs text-center mt-1">{project.progress}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Project Duration</span>
                  <span className="font-medium">14 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">On-time Delivery Rate</span>
                  <span className="font-medium text-green-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Client Satisfaction</span>
                  <span className="font-medium text-blue-600">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Utilization</span>
                  <span className="font-medium">81%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
                <CardDescription>Progress towards monthly targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Projects Completed</span>
                    <span>8/12</span>
                  </div>
                  <Progress value={67} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Revenue Target</span>
                    <span>$45K/$60K</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Client Acquisition</span>
                    <span>3/5</span>
                  </div>
                  <Progress value={60} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <User className="mr-2 h-4 w-4" />
                  Add Team Member
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Building2 className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
