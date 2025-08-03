"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  MoreHorizontal,
  Check,
  Trash2,
  Settings,
  Search,
  Filter,
  Video,
  MessageSquare,
  Calendar,
  RefreshCw,
} from "lucide-react"
import { useAuthStore } from "../stores/auth-store"

const mockNotifications = [
  {
    id: "1",
    userId: "mike-chen",
    title: "Project Update: Product Launch Video",
    message: "Your video editing is 75% complete. The editor has made significant progress on your project.",
    type: "project_update",
    read: false,
    createdAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "2",
    userId: "mike-chen",
    title: "New Comment Added",
    message: "John Editor replied to your comment on the logo animation section.",
    type: "comment_added",
    read: false,
    createdAt: "2024-01-20T14:45:00Z",
  },
  {
    id: "3",
    userId: "mike-chen",
    title: "Video Ready for Review",
    message: "Your Company Overview video is ready for final review and approval.",
    type: "video_ready",
    read: true,
    createdAt: "2024-01-19T16:20:00Z",
  },
  {
    id: "4",
    userId: "mike-chen",
    title: "Deadline Reminder",
    message: "Your Product Launch Video project is due in 2 days.",
    type: "deadline_reminder",
    read: true,
    createdAt: "2024-01-19T09:00:00Z",
  },
]

export function NotificationsContent() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const loadNotifications = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    setRefreshing(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project_update":
        return <Video className="h-5 w-5 text-blue-500" />
      case "comment_added":
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case "video_ready":
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      case "deadline_reminder":
        return <Calendar className="h-5 w-5 text-orange-500" />
      case "chat_message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "project_update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "comment_added":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "video_ready":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "deadline_reminder":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      case "chat_message":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "info":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    }
  }

  const filterNotifications = (notifications: any[], filter: string) => {
    let filtered = notifications.filter((n) => n.userId === user?.id)

    // Apply tab filter
    switch (filter) {
      case "unread":
        filtered = filtered.filter((n) => !n.read)
        break
      case "read":
        filtered = filtered.filter((n) => n.read)
        break
      case "project_updates":
        filtered = filtered.filter((n) => n.type === "project_update" || n.type === "video_ready")
        break
      case "comments":
        filtered = filtered.filter((n) => n.type === "comment_added" || n.type === "chat_message")
        break
      case "reminders":
        filtered = filtered.filter((n) => n.type === "deadline_reminder")
        break
      default:
        // "all" - no additional filtering
        break
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((n) => n.type === typeFilter)
    }

    return filtered
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
  }

  const unreadCount = notifications.filter((n) => n.userId === user?.id && !n.read).length
  const filteredNotifications = filterNotifications(notifications, activeTab)

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-lg"></div>
          ))}
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
              Stay updated with your projects and team activities
              {unreadCount > 0 && (
                <span className="ml-2">
                  <Badge variant="destructive">{unreadCount} unread</Badge>
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="project_update">Project Updates</SelectItem>
            <SelectItem value="comment_added">Comments</SelectItem>
            <SelectItem value="video_ready">Video Ready</SelectItem>
            <SelectItem value="deadline_reminder">Reminders</SelectItem>
            <SelectItem value="chat_message">Chat Messages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger
            value="all"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            All ({notifications.filter((n) => n.userId === user?.id).length})
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger
            value="project_updates"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Projects (
            {
              notifications.filter(
                (n) => n.userId === user?.id && (n.type === "project_update" || n.type === "video_ready"),
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Comments (
            {
              notifications.filter(
                (n) => n.userId === user?.id && (n.type === "comment_added" || n.type === "chat_message"),
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="reminders"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Reminders ({notifications.filter((n) => n.userId === user?.id && n.type === "deadline_reminder").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md bg-slate-800 border-slate-700 ${
                  !notification.read ? "border-purple-600/50 bg-purple-900/10" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-white">{notification.title}</h3>
                          <p className="text-sm text-slate-300 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge className={getNotificationTypeColor(notification.type)}>
                              {notification.type.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
                            {!notification.read && (
                              <Badge variant="destructive" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={() => markAsRead(notification.id)}
                                className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
              <p className="text-slate-400">
                {activeTab === "all"
                  ? "You're all caught up! No notifications to show."
                  : searchTerm || typeFilter !== "all"
                    ? "No notifications match your current filters."
                    : `No ${activeTab.replace("_", " ")} notifications found.`}
              </p>
              {(searchTerm || typeFilter !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setTypeFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
