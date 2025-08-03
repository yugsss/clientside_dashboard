import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 })
    }

    // For now, just return success since we're using mock data
    // In a real implementation, this would remove the subscription
    console.log("Push notification unsubscription received for user:", userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error)
    return NextResponse.json({ error: "Failed to unsubscribe from notifications" }, { status: 500 })
  }
}
