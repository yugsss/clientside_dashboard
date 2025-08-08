"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Upload,
  Eye,
  EyeOff,
  Key,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Video,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { useAuthStore } from "../stores/auth-store"

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    comments: boolean
    projectUpdates: boolean
    billing: boolean
  }
  privacy: {
    profileVisible: boolean
    activityVisible: boolean
  }
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    timezone: string
  }
}

export function SettingsContent() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [frameioConnected, setFrameioConnected] = useState(true)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState({
    name: user?.name || "Sarah Johnson",
    email: user?.email || "sarah@example.com",
    company: user?.company || "Tech Corp",
    bio: "",
    location: "",
    website: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      comments: true,
      projectUpdates: true,
      billing: false,
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
    },
    preferences: {
      theme: "dark",
      language: "en",
      timezone: "UTC",
    },
  })

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    console.log("=== Loading settings ===")
    setLoading(true)
    setLoadError(null)

    try {
      console.log("Making fetch request to /api/settings")

      const response = await fetch("/api/settings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-cache",
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response not OK. Status:", response.status, "Text:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      console.log("Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Response is not JSON. Content-Type:", contentType, "Response:", responseText)
        throw new Error(`Expected JSON response but got ${contentType}. Response: ${responseText.substring(0, 200)}...`)
      }

      const data = await response.json()
      console.log("Parsed JSON data:", data)

      if (data.success && data.settings) {
        setSettings(data.settings)
        setSettingsLoaded(true)
        console.log("Settings loaded successfully:", data.settings)

        toast({
          title: "Settings Loaded",
          description: "Your settings have been loaded successfully.",
        })
      } else {
        throw new Error(data.error || data.details || "Invalid response format")
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setLoadError(errorMessage)

      toast({
        title: "Settings Load Error",
        description: `Failed to load settings: ${errorMessage}. Using defaults.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    setSaving(true)
    try {
      // Simulate API call for profile update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (profileData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Simulate API call for password change
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setProfileData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      toast({
        title: "Success",
        description: "Password changed successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const connectFrameio = async () => {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setFrameioConnected(true)
      toast({
        title: "Success",
        description: "Frame.io connected successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Frame.io.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const disconnectFrameio = async () => {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFrameioConnected(false)
      toast({
        title: "Success",
        description: "Frame.io disconnected successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Frame.io.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveSettings = async () => {
    console.log("=== Saving settings ===")
    setSaving(true)

    try {
      console.log("Settings to save:", settings)

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(settings),
        cache: "no-cache",
      })

      console.log("Save response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Save response not OK. Status:", response.status, "Text:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Save response is not JSON. Content-Type:", contentType, "Response:", responseText)
        throw new Error(`Expected JSON response but got ${contentType}`)
      }

      const data = await response.json()
      console.log("Save response data:", data)

      if (data.success) {
        console.log("Settings saved successfully:", data.settings)
        toast({
          title: "Settings Saved",
          description: "Your settings have been saved successfully!",
        })
      } else {
        throw new Error(data.error || data.details || "Save operation failed")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Save Error",
        description: `Failed to save settings: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationSetting = (key: keyof Settings["notifications"], value: boolean) => {
    console.log(`Updating notification setting: ${key} = ${value}`)
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const updatePrivacySetting = (key: keyof Settings["privacy"], value: boolean) => {
    console.log(`Updating privacy setting: ${key} = ${value}`)
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const updatePreferenceSetting = (key: keyof Settings["preferences"], value: string) => {
    console.log(`Updating preference setting: ${key} = ${value}`)
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-white">Loading settings...</span>
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
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
            {loadError && (
              <div className="flex items-center mt-2 text-amber-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Using default settings due to load error</span>
              </div>
            )}
            {settingsLoaded && (
              <div className="flex items-center mt-2 text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Settings loaded successfully</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadSettings}
            disabled={loading}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Reload
          </Button>
          <Button onClick={saveSettings} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger
            value="profile"
            className="flex items-center text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="flex items-center text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Video className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-slate-400">
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-purple-600 text-white text-xl">SJ</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-300">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, company: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Role</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-600 text-white">client</Badge>
                    <span className="text-sm text-slate-500">Contact admin to change role</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={saving}
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-slate-400">
                Choose how you want to be notified about updates and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <Label className="text-base text-white">Email Notifications</Label>
                    </div>
                    <p className="text-sm text-slate-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                      <Label className="text-base text-white">Push Notifications</Label>
                    </div>
                    <p className="text-sm text-slate-500">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateNotificationSetting("push", checked)}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-slate-400" />
                      <Label className="text-base text-white">Comment Notifications</Label>
                    </div>
                    <p className="text-sm text-slate-500">Get notified when someone comments on your projects</p>
                  </div>
                  <Switch
                    checked={settings.notifications.comments}
                    onCheckedChange={(checked) => updateNotificationSetting("comments", checked)}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-slate-400" />
                      <Label className="text-base text-white">Project Updates</Label>
                    </div>
                    <p className="text-sm text-slate-500">Receive updates about project status changes</p>
                  </div>
                  <Switch
                    checked={settings.notifications.projectUpdates}
                    onCheckedChange={(checked) => updateNotificationSetting("projectUpdates", checked)}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-slate-400" />
                      <Label className="text-base text-white">Billing Notifications</Label>
                    </div>
                    <p className="text-sm text-slate-500">Get notified about billing and payment updates</p>
                  </div>
                  <Switch
                    checked={settings.notifications.billing}
                    onCheckedChange={(checked) => updateNotificationSetting("billing", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Appearance Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => updatePreferenceSetting("theme", value)}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="mr-2 h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="mr-2 h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Monitor className="mr-2 h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-2">
                  <Label className="text-white">Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => updatePreferenceSetting("language", value)}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-2">
                  <Label className="text-white">Timezone</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => updatePreferenceSetting("timezone", value)}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="PST">Pacific Standard Time</SelectItem>
                      <SelectItem value="EST">Eastern Standard Time</SelectItem>
                      <SelectItem value="CST">Central Standard Time</SelectItem>
                      <SelectItem value="MST">Mountain Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Password & Security</CardTitle>
              <CardDescription className="text-slate-400">Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-white">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-slate-900 border-slate-600 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-white">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    saving || !profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>

              <Separator className="bg-slate-700" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white">Privacy Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Profile visible to others</span>
                    <Switch
                      checked={settings.privacy.profileVisible}
                      onCheckedChange={(checked) => updatePrivacySetting("profileVisible", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Activity visible to team</span>
                    <Switch
                      checked={settings.privacy.activityVisible}
                      onCheckedChange={(checked) => updatePrivacySetting("activityVisible", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Frame.io Integration</CardTitle>
              <CardDescription className="text-slate-400">
                Connect your Frame.io account for seamless video collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Frame.io</h3>
                    <p className="text-sm text-slate-400">
                      {frameioConnected ? "Connected and syncing" : "Not connected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {frameioConnected ? (
                    <>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectFrameio}
                        disabled={saving}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={connectFrameio}
                      disabled={saving}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Frame.io"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {frameioConnected && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-white">Integration Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Auto-sync projects</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Sync comments</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Real-time notifications</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Enable emoji reactions</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Priority comment system</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
