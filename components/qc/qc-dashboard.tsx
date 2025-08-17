"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, Star } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"

export function QCDashboard() {
  const { user } = useAuthStore()
  const [reviewQueue, setReviewQueue] = useState([])
  const [stats, setStats] = useState({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgReviewTime: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQCData()
  }, [])

  const fetchQCData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        pendingReviews: 6,
        approvedToday: 8,
        rejectedToday: 2,
        avgReviewTime: 45,
      })
      setReviewQueue([])
    } catch (error) {
      console.error("Failed to fetch QC data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading QC dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">QC Dashboard</h1>
          <p className="text-slate-400">Review and approve video projects</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            Bulk Approve
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingReviews}</div>
            <p className="text-xs text-orange-400">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.approvedToday}</div>
            <p className="text-xs text-green-400">Quality passed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.rejectedToday}</div>
            <p className="text-xs text-red-400">Needs revision</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Review Time</CardTitle>
            <Star className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgReviewTime}m</div>
            <p className="text-xs text-blue-400">Per project</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="queue" className="data-[state=active]:bg-purple-600">
            Review Queue
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">
            Completed Reviews
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="data-[state=active]:bg-purple-600">
            QC Guidelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Projects Awaiting Review</CardTitle>
              <CardDescription className="text-slate-400">
                Videos submitted by editors for quality control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Product Launch Video</h3>
                      <p className="text-slate-400 text-sm">Editor: Sarah Editor • Client: Tech Startup</p>
                    </div>
                    <Badge className="bg-orange-600/20 text-orange-300">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      High Priority
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    Final cut of product launch video with motion graphics and color correction applied.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-400">Submitted: 2 hours ago</div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-600 text-red-300 bg-transparent">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
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
              <CardTitle className="text-white">Completed Reviews</CardTitle>
              <CardDescription className="text-slate-400">Your recent QC decisions and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Completed reviews history would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quality Control Guidelines</CardTitle>
              <CardDescription className="text-slate-400">Standards and criteria for video approval</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">QC guidelines and standards would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
