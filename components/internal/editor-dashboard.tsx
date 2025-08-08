"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, Clock, CheckCircle, AlertCircle, Calendar, Plus, Bell, Settings, ListTodo, FlagIcon as InProgress, CheckCircle2 } from 'lucide-react'

interface Project {
  id: string
  title: string
  client: string
  status: "assigned" | "in_progress" | "qc_review" | "completed"
  priority: "urgent" | "high" | "medium" | "low"
  progress: number
  dueDate: string
  timeSpent: number
  milestones: {
    roughCut: boolean
    colorCorrection: boolean
    audioMix: boolean
    finalRender: boolean
  }
  isTimerRunning: boolean
}

interface EditorTask {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  completed_at?: string
  created_at: string
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Corporate Training Video",
    client: "Acme Corp",
    status: "in_progress",
    priority: "urgent",
    progress: 45,
    dueDate: "2024-01-20",
    timeSpent: 8.5,
    milestones: {
      roughCut: true,
      colorCorrection: false,
      audioMix: false,
      finalRender: false,
    },
    isTimerRunning: false,
  },
  {
    id: "2",
    title: "Product Launch Promo",
    client: "TechStart Inc",
    status: "in_progress",
    priority: "high",
    progress: 75,
    dueDate: "2024-01-25",
    timeSpent: 12.2,
    milestones: {
      roughCut: true,
      colorCorrection: true,
      audioMix: true,
      finalRender: false,
    },
    isTimerRunning: true,
  },
  {
    id: "3",
    title: "Event Highlights Reel",
    client: "EventCo",
    status: "qc_review",
    priority: "medium",
    progress: 100,
    dueDate: "2024-01-18",
    timeSpent: 15.8,
    milestones: {
      roughCut: true,
      colorCorrection: true,
      audioMix: true,
      finalRender: true,
    },
    isTimerRunning: false,
  },
  {
    id: "4",
    title: "Social Media Campaign",
    client: "Brand Studio",
    status: "completed",
    priority: "low",
    progress: 100,
    dueDate: "2024-01-15",
    timeSpent: 18.5,
    milestones: {
      roughCut: true,
      colorCorrection: true,
      audioMix: true,
      finalRender: true,
    },
    isTimerRunning: false,
  },
]

export function EditorDashboard() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [tasks, setTasks] = useState<EditorTask[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const [showCreateTask, setShowCreateTask] = useState(false)
  const { toast } = useToast()

  const [newTask, setNewTask] = useState({
    project_id: "",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    due_date: ""
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/editor/tasks")
      const data = await response.json()

      if (data.success) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.project_id) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/editor/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Task created successfully"
        })
        setShowCreateTask(false)
        setNewTask({ project_id: "", title: "", description: "", priority: "medium", due_date: "" })
        loadTasks()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to create task:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<EditorTask>) => {
    try {
      const response = await fetch(`/api/editor/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (data.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ))
        toast({
          title: "Success",
          description: "Task updated successfully"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const handleProgressChange = (projectId: string, newProgress: number[]) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, progress: newProgress[0] } : project)),
    )
  }

  const handleMilestoneToggle = (projectId: string, milestone: keyof Project["milestones"]) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              milestones: {
                ...project.milestones,
                [milestone]: !project.milestones[milestone],
              },
            }
          : project,
      ),
    )
  }

  const handleTimerToggle = (projectId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, isTimerRunning: !project.isTimerRunning } : project,
      ),
    )
  }

  const handleSubmitForReview = (projectId: string) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, status: "qc_review" as const } : project)),
    )
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-500"
      case "in_progress":
        return "bg-purple-500"
      case "qc_review":
        return "bg-orange-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeProjects = projects.filter((p) => ["assigned", "in_progress"].includes(p.status))
  const reviewProjects = projects.filter((p) => p.status === "qc_review")
  const completedProjects = projects.filter((p) => p.status === "completed")

  const todoTasks = tasks.filter(t => t.status === "todo")
  const inProgressTasks = tasks.filter(t => t.status === "in_progress")
  const completedTasks = tasks.filter(t => t.status === "completed")

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg">{project.title}</CardTitle>
            <p className="text-slate-400 text-sm">Client: {project.client}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getPriorityColor(project.priority)} text-white`}>{project.priority}</Badge>
            <Badge className={`${getStatusColor(project.status)} text-white`}>{project.status.replace("_", " ")}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="text-slate-400">{project.progress}%</span>
          </div>
          <Slider
            value={[project.progress]}
            onValueChange={(value) => handleProgressChange(project.id, value)}
            max={100}
            step={5}
            className="w-full"
            disabled={project.status !== "in_progress"}
          />
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Milestones</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${project.id}-rough`}
                checked={project.milestones.roughCut}
                onCheckedChange={() => handleMilestoneToggle(project.id, "roughCut")}
                disabled={project.status !== "in_progress"}
              />
              <label htmlFor={`${project.id}-rough`} className="text-sm text-slate-300">
                Rough Cut
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${project.id}-color`}
                checked={project.milestones.colorCorrection}
                onCheckedChange={() => handleMilestoneToggle(project.id, "colorCorrection")}
                disabled={project.status !== "in_progress"}
              />
              <label htmlFor={`${project.id}-color`} className="text-sm text-slate-300">
                Color Correction
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${project.id}-audio`}
                checked={project.milestones.audioMix}
                onCheckedChange={() => handleMilestoneToggle(project.id, "audioMix")}
                disabled={project.status !== "in_progress"}
              />
              <label htmlFor={`${project.id}-audio`} className="text-sm text-slate-300">
                Audio Mix
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${project.id}-render`}
                checked={project.milestones.finalRender}
                onCheckedChange={() => handleMilestoneToggle(project.id, "finalRender")}
                disabled={project.status !== "in_progress"}
              />
              <label htmlFor={`${project.id}-render`} className="text-sm text-slate-300">
                Final Render
              </label>
            </div>
          </div>
        </div>

        {/* Time Tracking */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300">{project.timeSpent}h logged</span>
          </div>
          {project.status === "in_progress" && (
            <Button
              onClick={() => handleTimerToggle(project.id)}
              size="sm"
              variant={project.isTimerRunning ? "destructive" : "default"}
            >
              {project.isTimerRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </>
              )}
            </Button>
          )}
        </div>

        {/* Due Date */}
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <Calendar className="h-4 w-4" />
          <span>Due: {project.dueDate}</span>
        </div>

        {/* Submit Button */}
        {project.status === "in_progress" && project.progress === 100 && (
          <Button onClick={() => handleSubmitForReview(project.id)} className="w-full bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit for Review
          </Button>
        )}
      </CardContent>
    </Card>
  )

  const TaskCard = ({ task }: { task: EditorTask }) => {
    const project = projects.find(p => p.id === task.project_id)
    
    return (
      <Card className="bg-slate-700 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-white">{task.title}</h4>
              {project && (
                <p className="text-sm text-slate-400">Project: {project.title}</p>
              )}
              {task.description && (
                <p className="text-sm text-slate-300 mt-1">{task.description}</p>
              )}
            </div>
            <Badge className={`${getPriorityColor(task.priority)} text-white ml-2`}>
              {task.priority}
            </Badge>
          </div>
          
          {task.due_date && (
            <div className="flex items-center space-x-2 text-sm text-slate-400 mb-3">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Select
              value={task.status}
              onValueChange={(value: "todo" | "in_progress" | "completed") => 
                handleUpdateTask(task.id, { status: value })
              }
            >
              <SelectTrigger className="w-32 bg-slate-600 border-slate-500 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            {task.completed_at && (
              <span className="text-xs text-green-400">
                Completed: {new Date(task.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-10 w-10 rounded object-cover" />
          <div>
            <h1 className="text-3xl font-bold text-white">Editor Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage your projects and tasks</p>
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
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger
            value="projects"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Projects
          </TabsTrigger>
          <TabsTrigger
            value="todo"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <ListTodo className="mr-2 h-4 w-4" />
            To Do ({todoTasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <InProgress className="mr-2 h-4 w-4" />
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Completed ({completedTasks.length})
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
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Projects</CardTitle>
                <AlertCircle className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{activeProjects.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">In Review</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{reviewProjects.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{completedProjects.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Hours This Week</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">42.5</div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {reviewProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        {/* To Do Tasks Tab */}
        <TabsContent value="todo" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">To Do Tasks</h2>
            <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project" className="text-slate-300">Project</Label>
                    <Select value={newTask.project_id} onValueChange={(value) => setNewTask(prev => ({ ...prev, project_id: value }))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-300">Task Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-300">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-slate-300">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => setNewTask(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-slate-300">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateTask(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTask}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {todoTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {todoTasks.length === 0 && (
            <div className="text-center py-12">
              <ListTodo className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No tasks to do</h3>
              <p className="text-slate-400">Create a new task to get started.</p>
            </div>
          )}
        </TabsContent>

        {/* In Progress Tasks Tab */}
        <TabsContent value="in-progress" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">In Progress Tasks</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {inProgressTasks.length === 0 && (
            <div className="text-center py-12">
              <InProgress className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No tasks in progress</h3>
              <p className="text-slate-400">Move tasks from To Do to start working on them.</p>
            </div>
          )}
        </TabsContent>

        {/* Completed Tasks Tab */}
        <TabsContent value="completed" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Completed Tasks</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {completedTasks.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No completed tasks</h3>
              <p className="text-slate-400">Completed tasks will appear here.</p>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Editor Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Settings</h3>
                <p className="text-slate-400">Editor preferences and configuration options will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
