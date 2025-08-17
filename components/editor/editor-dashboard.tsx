"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock, CheckCircle, Upload, MessageSquare, Calendar, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"

export function EditorDashboard() {
  const { user } = useAuthStore()
  const [assignedProjects, setAssignedProjects] = useState([])
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedThisMonth: 0,
    avgTurnaround: 0,
    pendingReviews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEditorData()
  }, [])

  const fetchEditorData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        activeProjects: 4,
        completedThisMonth: 12,
        avgTurnaround: 2.5,
        pendingReviews: 2,
      })
      setAssignedProjects([])
    } catch (error) {
      console.error("Failed to fetch editor data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading editor dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Editor Dashboard</h1>
          <p className="text-slate-400">Manage your assigned projects and deliverables</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Draft
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Projects</CardTitle>
            <Play className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
            <p className="text-xs text-slate-400">Currently editing</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completedThisMonth}</div>
            <p className="text-xs text-green-400">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgTurnaround} days</div>
            <p className="text-xs text-blue-400">Personal best</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingReviews}</div>
            <p className="text-xs text-orange-400">Awaiting QC</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-600">
            Active Projects
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">
            Completed
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-600">
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Current Assignments</CardTitle>
              <CardDescription className="text-slate-400">Projects assigned to you for editing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Brand Promotional Video</h3>
                      <p className="text-slate-400 text-sm">Client: Acme Corporation</p>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-300">In Progress</Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    Create a 60-second promotional video highlighting the brand's key features and benefits.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-sm text-slate-400">
                      <Calendar className="mr-2 h-4 w-4" />
                      Due: Dec 25, 2024
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Client
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Update Progress
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Completed Projects</CardTitle>
              <CardDescription className="text-slate-400">Your recently finished work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Completed projects list would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Project Schedule</CardTitle>
              <CardDescription className="text-slate-400">Upcoming deadlines and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Schedule calendar would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
