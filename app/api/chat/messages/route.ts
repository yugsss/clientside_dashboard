import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { DatabaseService } from "../../../../lib/database"

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
    const projectId = searchParams.get("projectId")

    const db = DatabaseService.getInstance()
    const messages = await db.getChatMessages(projectId ? Number.parseInt(projectId) : undefined)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request)
    const { content, projectId } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    const message = await db.createChatMessage({
      user_id: userId,
      project_id: projectId || null,
      content,
      message_type: "text",
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
