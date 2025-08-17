"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Video, DollarSign, Clock, AlertCircle, CheckCircle, UserPlus, Settings } from "lucide-react"
import { WorkloadManagement } from "./workload-management"
import AnalyticsDashboard from "./analytics-dashboard"
import { useAuthStore } from "@/stores/auth-store"

interface AdminStats {
  totalUsers: number
  activeProjects: number
  monthlyRevenue: number
  avgTurnaround: number
  pendingAssignments: number
  completedThisMonth: number
}

export function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    avgTurnaround: 0,
    pendingAssignments: 0,
    completedThisMonth: 0,
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalUsers: 156,
        activeProjects: 23,
        monthlyRevenue: 12450,
        avgTurnaround: 2.8,
        pendingAssignments: 8,
        completedThisMonth: 45,
      })
      setRecentProjects([])
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400">Manage projects, users, and business analytics</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <p className="text-xs text-green-400">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Projects</CardTitle>
            <Video className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
            <p className="text-xs text-blue-400">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-400">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgTurnaround} days</div>
            <p className="text-xs text-green-400">-0.3 days improved</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Assignments</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingAssignments}</div>
            <p className="text-xs text-orange-400">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completedThisMonth}</div>
            <p className="text-xs text-slate-400">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="workload" className="data-[state=active]:bg-purple-600">
            Workload Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">Latest project updates and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">Project "Brand Video" completed by Sarah Editor</p>
                      <p className="text-xs text-slate-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">New project "Product Demo" created by John Client</p>
                      <p className="text-xs text-slate-400">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">QC review requested for "Marketing Video"</p>
                      <p className="text-xs text-slate-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Team Workload</CardTitle>
                <CardDescription className="text-slate-400">Current editor and QC assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                        SE
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Sarah Editor</p>
                        <p className="text-xs text-slate-400">Video Editor</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                      3 projects
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                        AE
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Alex Editor</p>
                        <p className="text-xs text-slate-400">Video Editor</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                      5 projects
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                        QS
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">QC Specialist</p>
                        <p className="text-xs text-slate-400">Quality Control</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                      2 reviews
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workload">
          <WorkloadManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
