import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get("x-frameio-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const secret = process.env.FRAMEIO_WEBHOOK_SECRET
    if (!secret) {
      console.error("FRAMEIO_WEBHOOK_SECRET not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    const crypto = require("crypto")
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

    if (signature !== `sha256=${expectedSignature}`) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Process webhook event
    console.log("Frame.io webhook event:", event.type, event)

    // Handle different event types
    switch (event.type) {
      case "asset.created":
        console.log("New asset created:", event.data)
        break
      case "comment.created":
        console.log("New comment created:", event.data)
        break
      case "comment.updated":
        console.log("Comment updated:", event.data)
        break
      case "project.updated":
        console.log("Project updated:", event.data)
        break
      default:
        console.log("Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Failed to process Frame.io webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
