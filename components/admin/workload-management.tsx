"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, AlertTriangle, Clock, CheckCircle, UserCheck, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WorkloadData {
  editors: any[]
  qc: any[]
  unassigned: any[]
  summary: {
    totalEditors: number
    totalQC: number
    totalUnassigned: number
    avgEditorWorkload: number
    avgQCWorkload: number
  }
}

export function WorkloadManagement() {
  const [workloadData, setWorkloadData] = useState<WorkloadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkloadData()
  }, [])

  const fetchWorkloadData = async () => {
    try {
      const response = await fetch("/api/admin/workload")
      const data = await response.json()
      setWorkloadData(data)
    } catch (error) {
      console.error("Failed to fetch workload data:", error)
      toast({
        title: "Error",
        description: "Failed to load workload data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignProject = async (projectId: string, editorId: string, qcId?: string) => {
    setAssigning(projectId)
    try {
      const response = await fetch("/api/projects/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          projectId,
          editorId,
          qcId,
          priority: "medium",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Project assigned successfully",
        })
        fetchWorkloadData() // Refresh data
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign project",
        variant: "destructive",
      })
    } finally {
      setAssigning(null)
    }
  }

  const getWorkloadColor = (active: number, capacity: number) => {
    const utilization = active / (active + capacity)
    if (utilization >= 0.9) return "text-red-400"
    if (utilization >= 0.7) return "text-orange-400"
    if (utilization >= 0.5) return "text-yellow-400"
    return "text-green-400"
  }

  const getCapacityPercentage = (active: number, capacity: number) => {
    return (active / (active + capacity)) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading workload data...</p>
        </div>
      </div>
    )
  }

  if (!workloadData) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Failed to load workload data</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Workload Management</h1>
          <p className="text-slate-400">Monitor team capacity and assign projects efficiently</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <BarChart3 className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Editors</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{workloadData.summary.totalEditors}</div>
            <p className="text-xs text-slate-400">Active team members</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">QC Team</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{workloadData.summary.totalQC}</div>
            <p className="text-xs text-slate-400">Quality reviewers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Unassigned</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{workloadData.summary.totalUnassigned}</div>
            <p className="text-xs text-orange-400">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Editor Load</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{workloadData.summary.avgEditorWorkload.toFixed(1)}</div>
            <p className="text-xs text-slate-400">Projects per editor</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg QC Load</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{workloadData.summary.avgQCWorkload.toFixed(1)}</div>
            <p className="text-xs text-slate-400">Reviews per QC</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Workload */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Editor Workload</CardTitle>
            <CardDescription className="text-slate-400">Current capacity and active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workloadData.editors.map((editor) => (
                <div
                  key={editor.id}
                  className="flex items-center justify-between p-3 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={editor.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {editor.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{editor.name}</p>
                      <p className="text-xs text-slate-400">{editor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium ${getWorkloadColor(editor.workload.active, editor.workload.capacity)}`}
                        >
                          {editor.workload.active}/{editor.workload.active + editor.workload.capacity}
                        </span>
                        {editor.workload.urgent > 0 && (
                          <Badge className="bg-red-600/20 text-red-300 text-xs">{editor.workload.urgent} urgent</Badge>
                        )}
                      </div>
                      <Progress
                        value={getCapacityPercentage(editor.workload.active, editor.workload.capacity)}
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Projects */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Unassigned Projects</CardTitle>
            <CardDescription className="text-slate-400">Projects waiting for team assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workloadData.unassigned.slice(0, 5).map((project) => (
                <div key={project.id} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                      <p className="text-xs text-slate-400">Client: {project.client?.name}</p>
                    </div>
                    <Badge className="bg-orange-600/20 text-orange-300 text-xs">{project.priority}</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Select onValueChange={(editorId) => handleAssignProject(project.id, editorId)}>
                      <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Assign Editor" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {workloadData.editors
                          .filter((e) => e.workload.capacity > 0)
                          .map((editor) => (
                            <SelectItem key={editor.id} value={editor.id}>
                              {editor.name} ({editor.workload.active} active)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" disabled={assigning === project.id} className="bg-purple-600 hover:bg-purple-700">
                      <UserCheck className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
