"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, UserCheck, Clock, AlertCircle } from "lucide-react"

export function AdminProjectsView() {
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Mock data - replace with actual API call
      setProjects([])
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-600/30"
      case "assigned":
        return "bg-blue-600/20 text-blue-300 border-blue-600/30"
      case "in_progress":
        return "bg-purple-600/20 text-purple-300 border-purple-600/30"
      case "qc_review":
        return "bg-orange-600/20 text-orange-300 border-orange-600/30"
      case "client_review":
        return "bg-indigo-600/20 text-indigo-300 border-indigo-600/30"
      case "completed":
        return "bg-green-600/20 text-green-300 border-green-600/30"
      default:
        return "bg-slate-600/20 text-slate-300 border-slate-600/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">All Projects</h1>
          <p className="text-slate-400">Manage and assign projects across the platform</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <UserCheck className="mr-2 h-4 w-4" />
            Bulk Assign
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending Assignment</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="qc_review">QC Review</SelectItem>
            <SelectItem value="client_review">Client Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Tabs */}
      <Tabs defaultValue="unassigned" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="unassigned" className="data-[state=active]:bg-purple-600">
            Unassigned (8)
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-600">
            Active (23)
          </TabsTrigger>
          <TabsTrigger value="review" className="data-[state=active]:bg-purple-600">
            In Review (6)
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">
            Completed (145)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-400" />
                Projects Awaiting Assignment
              </CardTitle>
              <CardDescription className="text-slate-400">
                New projects that need editor and QC assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Corporate Training Video</h3>
                      <p className="text-slate-400 text-sm">Client: Enterprise Corp • Plan: Ultimate</p>
                    </div>
                    <Badge className="bg-red-600/20 text-red-300 border-red-600/30">
                      <Clock className="mr-1 h-3 w-3" />
                      Urgent
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    Create a comprehensive training video for new employee onboarding process.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-400">Created: 3 hours ago • Due: Dec 28, 2024</div>
                    <div className="flex space-x-2">
                      <Select>
                        <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Assign Editor" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="sarah">Sarah Editor</SelectItem>
                          <SelectItem value="alex">Alex Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Assign QC" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="qc1">QC Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="bg-purple-600 hover:bg-purple-700">Assign</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Active Projects</CardTitle>
              <CardDescription className="text-slate-400">Projects currently being worked on</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Active projects list would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Projects in Review</CardTitle>
              <CardDescription className="text-slate-400">Projects awaiting QC or client approval</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Review queue would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Completed Projects</CardTitle>
              <CardDescription className="text-slate-400">Successfully delivered projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Completed projects archive would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
