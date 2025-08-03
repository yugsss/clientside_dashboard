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
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const db = DatabaseService.getInstance()
    const notifications = await db.getNotifications(userId, unreadOnly)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
