import { type NextRequest, NextResponse } from "next/server"
import { database } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 })
    }

    // Remove subscription from database
    await database.query("DELETE FROM push_subscriptions WHERE user_id = $1", [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error)
    return NextResponse.json({ error: "Failed to unsubscribe from notifications" }, { status: 500 })
  }
}
