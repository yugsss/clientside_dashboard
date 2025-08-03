import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { DatabaseService } from "../../../lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    throw new Error("No token provided")
  }

  const decoded = jwt.verify(token, JWT_SECRET) as any
  return decoded.userId
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request)
    const db = DatabaseService.getInstance()
    const settings = await db.getUserSettings(userId)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request)
    const updates = await request.json()

    const db = DatabaseService.getInstance()
    const settings = await db.updateUserSettings(userId, updates)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
