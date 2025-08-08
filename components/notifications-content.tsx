"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Bell, Search, Filter, CheckCircle, AlertTriangle, Info, Video, Settings, Trash2, BookMarkedIcon as MarkAsUnread, RefreshCw, Calendar } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'system' | 'project_update' | 'comment' | 'warning' | 'success' | 'info'
  is_read: boolean
  created_at: string
  project_id?: string
}

export function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notifications")
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST"
      })

      const data = await response.json()

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        )
        toast({
          title: "Success",
          description: "Notification marked as read"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      })
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/unread`, {
        method: "POST"
      })

      const data = await response.json()

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: false }
              : notification
          )
        )
        toast({
          title: "Success",
          description: "Notification marked as unread"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to mark notification as unread:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as unread",
        variant: "destructive"
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (data.success) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        )
        toast({
          title: "Success",
          description: "Notification deleted"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST"
      })

      const data = await response.json()

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        )
        toast({
          title: "Success",
          description: "All notifications marked as read"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive"
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Settings className="h-4 w-4 text-blue-500" />
      case 'project_update':
        return <Video className="h-4 w-4 text-purple-500" />
      case 'comment':
        return <Bell className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-slate-500" />
    }
  }

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-500'
      case 'project_update':
        return 'bg-purple-500'
      case 'comment':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'success':
        return 'bg-green-500'
      case 'info':
        return 'bg-blue-500'
      default:
        return 'bg-slate-500'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || notification.type === filterType
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "unread" && !notification.is_read) ||
                      (activeTab === "read" && notification.is_read)
    
    return matchesSearch && matchesType && matchesTab
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-white">Loading notifications...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-10 w-10 rounded object-cover" />
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 mt-1">
              Stay updated with your projects and activities
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadCount} unread
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadNotifications}
            disabled={loading}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="project_update">Projects</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="warning">Warnings</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger
            value="all"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger
            value="read"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Read ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                <p className="text-slate-400">
                  {activeTab === "unread" 
                    ? "You're all caught up! No unread notifications."
                    : activeTab === "read"
                    ? "No read notifications found."
                    : "No notifications match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`bg-slate-800 border-slate-700 transition-all hover:bg-slate-750 ${
                    !notification.is_read ? 'border-l-4 border-l-purple-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-medium ${notification.is_read ? 'text-slate-300' : 'text-white'}`}>
                              {notification.title}
                            </h4>
                            <Badge className={`${getNotificationBadgeColor(notification.type)} text-white text-xs`}>
                              {notification.type.replace('_', ' ')}
                            </Badge>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${notification.is_read ? 'text-slate-400' : 'text-slate-300'} mb-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(notification.created_at).toLocaleDateString()} at{' '}
                              {new Date(notification.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        {notification.is_read ? (
                          <Button
                            onClick={() => markAsUnread(notification.id)}
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                          >
                            <MarkAsUnread className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
