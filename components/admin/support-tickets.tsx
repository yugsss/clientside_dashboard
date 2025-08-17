"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Clock, AlertTriangle, CheckCircle, User } from "lucide-react"

export function SupportTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      // Mock data - replace with actual API call
      setTickets([])
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading support tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
          <p className="text-slate-400">Manage customer support requests and issues</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <MessageSquare className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Open Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-orange-400">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8</div>
            <p className="text-xs text-blue-400">Being resolved</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">15</div>
            <p className="text-xs text-green-400">Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Response</CardTitle>
            <MessageSquare className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2.5h</div>
            <p className="text-xs text-slate-400">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Tabs */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="open" className="data-[state=active]:bg-purple-600">
            Open (12)
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-600">
            In Progress (8)
          </TabsTrigger>
          <TabsTrigger value="resolved" className="data-[state=active]:bg-purple-600">
            Resolved (156)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Open Support Tickets</CardTitle>
              <CardDescription className="text-slate-400">New tickets requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Video Quality Issue</h3>
                      <p className="text-slate-400 text-sm">
                        <User className="inline h-3 w-3 mr-1" />
                        John Client • john@client.com
                      </p>
                    </div>
                    <Badge className="bg-red-600/20 text-red-300 border-red-600/30">High Priority</Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    The delivered video has some quality issues with the audio sync. Can this be fixed?
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-400">Created: 2 hours ago • Project: Brand Video</div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        View Project
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Respond
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Tickets in Progress</CardTitle>
              <CardDescription className="text-slate-400">Currently being resolved by team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">In progress tickets would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Resolved Tickets</CardTitle>
              <CardDescription className="text-slate-400">Successfully resolved support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Resolved tickets archive would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
