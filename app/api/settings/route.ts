import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔧 API: Settings GET request received")

    // Get user ID from session cookie
    const sessionCookie = request.cookies.get("session")
    if (!sessionCookie) {
      console.log("❌ API: No session cookie found")
      return NextResponse.json({ success: false, error: "No session found" }, { status: 401 })
    }

    const userId = sessionCookie.value
    console.log("🔍 API: Loading settings for user:", userId)

    const db = DatabaseService.getInstance()
    const settings = await db.getUserSettings(userId)

    if (!settings) {
      console.log("❌ API: Settings not found for user:", userId)
      return NextResponse.json({ success: false, error: "Settings not found" }, { status: 404 })
    }

    console.log("✅ API: Settings loaded successfully for user:", userId)

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("💥 API: Settings GET error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔧 API: Settings PUT request received")

    // Get user ID from session cookie
    const sessionCookie = request.cookies.get("session")
    if (!sessionCookie) {
      console.log("❌ API: No session cookie found")
      return NextResponse.json({ success: false, error: "No session found" }, { status: 401 })
    }

    const userId = sessionCookie.value
    const body = await request.json()
    const { settings } = body

    console.log("🔍 API: Updating settings for user:", userId)
    console.log("📝 API: Settings data:", settings)

    if (!settings) {
      console.log("❌ API: No settings data provided")
      return NextResponse.json({ success: false, error: "Settings data is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    const updatedSettings = await db.updateUserSettings(userId, settings)

    if (!updatedSettings) {
      console.log("❌ API: Failed to update settings for user:", userId)
      return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
    }

    console.log("✅ API: Settings updated successfully for user:", userId)

    return NextResponse.json(
      {
        success: true,
        settings: updatedSettings,
        message: "Settings updated successfully",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("💥 API: Settings PUT error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
