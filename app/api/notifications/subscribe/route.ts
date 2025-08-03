import { type NextRequest, NextResponse } from "next/server"
import { database } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json()

    if (!subscription || !userId) {
      return NextResponse.json({ error: "Subscription and userId are required" }, { status: 400 })
    }

    // Store subscription in database
    await database.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, endpoint) 
       DO UPDATE SET p256dh_key = $3, auth_key = $4, updated_at = NOW()`,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error subscribing to push notifications:", error)
    return NextResponse.json({ error: "Failed to subscribe to notifications" }, { status: 500 })
  }
}
