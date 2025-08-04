"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Clock,
  Mail,
  Smartphone,
  MessageSquare,
  FileText,
  CreditCard,
  Eye,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import type { Settings } from "../types"

export function SettingsContent() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      console.log("🔧 Loading settings...")
      setLoading(true)
      setError("")

      const response = await fetch("/api/settings", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Settings response status:", response.status)
      console.log("📡 Settings response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Settings response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      console.log("📄 Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("❌ Invalid content type. Response:", responseText.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("✅ Settings loaded:", data)

      if (data.success && data.settings) {
        setSettings(data.settings)
        console.log("✅ Settings loaded successfully")
      } else {
        throw new Error(data.error || "Failed to load settings")
      }
    } catch (error) {
      console.error("💥 Failed to load settings:", error)
      setError(`Failed to load settings: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    try {
      console.log("💾 Saving settings...")
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/settings", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      })

      console.log("📡 Save response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Save response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Settings saved:", data)

      if (data.success) {
        setSettings(data.settings)
        setSuccess("Settings saved successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        throw new Error(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("💥 Failed to save settings:", error)
      setError(`Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (section: keyof Settings, key: string, value: any) => {
    if (!settings) return

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <Alert className="border-red-500/50 bg-red-500/10 max-w-2xl mx-auto">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={loadSettings} variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400">No settings found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Manage your account preferences and notifications</p>
          </div>
          <div className="flex items-center space-x-3">
            {success && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                {success}
              </Badge>
            )}
            <Button onClick={saveSettings} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10 mb-6">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-purple-600">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-600">
              <Palette className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-purple-400" />
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Choose how you want to be notified about updates and activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <div>
                        <Label className="text-white font-medium">Email Notifications</Label>
                        <p className="text-sm text-slate-400">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateSettings("notifications", "email", checked)}
                    />
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-green-400" />
                      <div>
                        <Label className="text-white font-medium">Push Notifications</Label>
                        <p className="text-sm text-slate-400">Receive push notifications on your device</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => updateSettings("notifications", "push", checked)}
                    />
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-yellow-400" />
                      <div>
                        <Label className="text-white font-medium">Comment Notifications</Label>
                        <p className="text-sm text-slate-400">Get notified when someone comments on your projects</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.comments}
                      onCheckedChange={(checked) => updateSettings("notifications", "comments", checked)}
                    />
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-400" />
                      <div>
                        <Label className="text-white font-medium">Project Updates</Label>
                        <p className="text-sm text-slate-400">Receive updates about your project status</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.projectUpdates}
                      onCheckedChange={(checked) => updateSettings("notifications", "projectUpdates", checked)}
                    />
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-red-400" />
                      <div>
                        <Label className="text-white font-medium">Billing Notifications</Label>
                        <p className="text-sm text-slate-400">Get notified about billing and payment updates</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.billing}
                      onCheckedChange={(checked) => updateSettings("notifications", "billing", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-400" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Control your privacy and what information is visible to others.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <div>
                        <Label className="text-white font-medium">Profile Visibility</Label>
                        <p className="text-sm text-slate-400">Make your profile visible to other users</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.privacy.profileVisible}
                      onCheckedChange={(checked) => updateSettings("privacy", "profileVisible", checked)}
                    />
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-green-400" />
                      <div>
                        <Label className="text-white font-medium">Activity Visibility</Label>
                        <p className="text-sm text-slate-400">Show your activity status to other users</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.privacy.activityVisible}
                      onCheckedChange={(checked) => updateSettings("privacy", "activityVisible", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-400" />
                  Preferences
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Customize your experience with theme, language, and regional settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center">
                      <Palette className="h-4 w-4 mr-2 text-purple-400" />
                      Theme
                    </Label>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value) => updateSettings("preferences", "theme", value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="light" className="text-white hover:bg-slate-600">
                          Light
                        </SelectItem>
                        <SelectItem value="dark" className="text-white hover:bg-slate-600">
                          Dark
                        </SelectItem>
                        <SelectItem value="system" className="text-white hover:bg-slate-600">
                          System
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-blue-400" />
                      Language
                    </Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => updateSettings("preferences", "language", value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="en" className="text-white hover:bg-slate-600">
                          English
                        </SelectItem>
                        <SelectItem value="es" className="text-white hover:bg-slate-600">
                          Spanish
                        </SelectItem>
                        <SelectItem value="fr" className="text-white hover:bg-slate-600">
                          French
                        </SelectItem>
                        <SelectItem value="de" className="text-white hover:bg-slate-600">
                          German
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-400" />
                      Timezone
                    </Label>
                    <Select
                      value={settings.preferences.timezone}
                      onValueChange={(value) => updateSettings("preferences", "timezone", value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="UTC" className="text-white hover:bg-slate-600">
                          UTC
                        </SelectItem>
                        <SelectItem value="EST" className="text-white hover:bg-slate-600">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="CST" className="text-white hover:bg-slate-600">
                          Central Time
                        </SelectItem>
                        <SelectItem value="MST" className="text-white hover:bg-slate-600">
                          Mountain Time
                        </SelectItem>
                        <SelectItem value="PST" className="text-white hover:bg-slate-600">
                          Pacific Time
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
