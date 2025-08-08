import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { DatabaseService } from "@/lib/database"
import { env } from "@/lib/env"

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

export async function GET(request: NextRequest) {
  try {
    console.log("⚙️ Get settings request received")

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string }
    } catch (error) {
      console.error("JWT verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const userSettings = await db.getUserSettings(decoded.userId)

    if (!userSettings) {
      console.log("No user settings found, creating defaults")
      const defaultSettings = await db.createDefaultUserSettings(decoded.userId)
      if (!defaultSettings) {
        return NextResponse.json({ success: false, error: "Failed to create default settings" }, { status: 500 })
      }
      
      // Return default settings
      const settings: Settings = {
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
        }
      }

      return NextResponse.json({
        success: true,
        settings,
      })
    }

    // Transform database settings to frontend format
    const settings: Settings = {
      notifications: {
        email: userSettings.email_notifications ?? true,
        push: userSettings.push_notifications ?? true,
        comments: userSettings.comment_notifications ?? true,
        projectUpdates: userSettings.project_update_notifications ?? true,
        billing: userSettings.billing_notifications ?? false,
      },
      privacy: {
        profileVisible: userSettings.profile_visible ?? true,
        activityVisible: userSettings.activity_visible ?? false,
      },
      preferences: {
        theme: (userSettings.theme as "light" | "dark" | "system") ?? "dark",
        language: userSettings.language ?? "en",
        timezone: userSettings.timezone ?? "UTC",
      }
    }

    console.log("✅ Settings retrieved successfully")
    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("💥 Get settings error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("⚙️ Update settings request received")

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: { userId: string; email: string; role: string }
    try {
      decoded = verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string }
    } catch (error) {
      console.error("JWT verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const settings: Settings = await request.json()

    // Transform frontend settings to database format
    const dbSettings = {
      email_notifications: settings.notifications.email,
      push_notifications: settings.notifications.push,
      comment_notifications: settings.notifications.comments,
      project_update_notifications: settings.notifications.projectUpdates,
      billing_notifications: settings.notifications.billing,
      profile_visible: settings.privacy.profileVisible,
      activity_visible: settings.privacy.activityVisible,
      theme: settings.preferences.theme,
      language: settings.preferences.language,
      timezone: settings.preferences.timezone,
      updated_at: new Date().toISOString()
    }

    const db = DatabaseService.getInstance()
    
    // Test database connection first
    const connectionTest = await db.testConnection()
    if (!connectionTest) {
      console.error("Database connection failed")
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const success = await db.updateUserSettings(decoded.userId, dbSettings)

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to update user settings" }, { status: 500 })
    }

    // Send notification about settings update
    try {
      await db.createNotification({
        user_id: decoded.userId,
        title: "Settings Updated",
        message: "Your account settings have been successfully updated.",
        type: "system",
        is_read: false
      })
    } catch (notificationError) {
      console.warn("Failed to create notification:", notificationError)
      // Don't fail the request if notification creation fails
    }

    console.log("✅ Settings updated successfully")
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: dbSettings
    })
  } catch (error) {
    console.error("💥 Update settings error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
