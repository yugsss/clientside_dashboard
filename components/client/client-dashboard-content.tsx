'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Clock, CheckCircle, AlertCircle, Play, Plus, Star, Users, Calendar, DollarSign } from 'lucide-react'
import { ProjectUpload } from './project-upload'
import { useAuthStore } from '@/stores/auth-store'
import type { Project } from '@/lib/supabase'

interface ClientDashboardContentProps {
  projects: Project[]
  onProjectCreated: () => void
}

export function ClientDashboardContent({ projects, onProjectCreated }: ClientDashboardContentProps) {
  const { user } = useAuthStore()
  const [showUpload, setShowUpload] = useState(false)
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    avgTurnaround: 0
  })

  useEffect(() => {
    if (projects.length > 0) {
      const active = projects.filter(p => 
        ['pending', 'assigned', 'in_progress', 'qc_review', 'client_review'].includes(p.status)
      ).length
      
      const completed = projects.filter(p => p.status === 'completed').length
      
      setStats({
        activeProjects: active,
        completedProjects: completed,
        totalSpent: user?.total_spent || 0,
        avgTurnaround: 3 // Mock data
      })
    }
  }, [projects, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'qc_review': return 'bg-orange-100 text-orange-800'
      case 'client_review': return 'bg-indigo-100 text-indigo-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'assigned': return <Users className="h-4 w-4" />
      case 'in_progress': return <Play className="h-4 w-4" />
      case 'qc_review': return <AlertCircle className="h-4 w-4" />
      case 'client_review': return <Star className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Plan-specific features
  const planFeatures = {
    basic: {
      maxProjects: 2,
      maxRevisions: 2,
      features: ['2 videos per month', '2 revisions per video', 'Standard turnaround'],
      color: 'text-blue-600'
    },
    pro: {
      maxProjects: 5,
      maxRevisions: 3,
      features: ['5 videos per month', '3 revisions per video', 'Priority support'],
      color: 'text-purple-600'
    },
    enterprise: {
      maxProjects: -1, // Unlimited
      maxRevisions: -1,
      features: ['Unlimited videos', 'Unlimited revisions', '24/7 support'],
      color: 'text-gold-600'
    }
  }

  const currentPlan = planFeatures[user?.plan_id as keyof typeof planFeatures] || planFeatures.basic
  const canCreateProject = currentPlan.maxProjects === -1 || stats.activeProjects < currentPlan.maxProjects

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mb-4">
          You're on the <span className="font-semibold">{user?.plan_name || 'Basic Plan'}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {currentPlan.features.map((feature, index) => (
            <Badge key={index} variant="secondary" className="bg-white/20 text-white">
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {currentPlan.maxProjects === -1 
                ? 'Unlimited' 
                : `${currentPlan.maxProjects - stats.activeProjects} remaining`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Total projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTurnaround} days</div>
            <p className="text-xs text-muted-foreground">Typical delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Projects Yet</CardTitle>
                <CardDescription>
                  Upload your first video project to get started with professional editing services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowUpload(true)} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{formatStatus(project.status)}</span>
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Revisions: {project.revisions}/{project.max_revisions}</span>
                        <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>

                      {project.due_date && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          Due: {new Date(project.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload">
          {canCreateProject ? (
            <ProjectUpload onProjectCreated={onProjectCreated} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Project Limit Reached</CardTitle>
                <CardDescription>
                  You've reached your plan limit of {currentPlan.maxProjects} active projects. 
                  Complete or cancel existing projects to upload new ones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload New Project</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUpload(false)}
                >
                  ×
                </Button>
              </div>
              <ProjectUpload 
                onProjectCreated={() => {
                  onProjectCreated()
                  setShowUpload(false)
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
