import { type NextRequest, NextResponse } from "next/server"
import { frameioConfig } from "../../../../lib/env"
import crypto from "crypto"

// Frame.io webhook event types
interface FrameIOWebhookEvent {
  event_type: string
  resource_type: string
  resource: {
    id: string
    name?: string
    type?: string
    project_id?: string
    [key: string]: any
  }
  timestamp: string
}

// Verify Frame.io webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-frameio-signature")

    // Verify webhook signature if secret is configured
    if (frameioConfig.webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, frameioConfig.webhookSecret)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event: FrameIOWebhookEvent = JSON.parse(body)

    // Handle different Frame.io events
    switch (event.event_type) {
      case "asset.created":
        await handleAssetCreated(event)
        break

      case "asset.updated":
        await handleAssetUpdated(event)
        break

      case "comment.created":
        await handleCommentCreated(event)
        break

      case "comment.updated":
        await handleCommentUpdated(event)
        break

      case "project.updated":
        await handleProjectUpdated(event)
        break

      default:
        console.log(`Unhandled Frame.io event: ${event.event_type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Frame.io webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleAssetCreated(event: FrameIOWebhookEvent) {
  console.log("New asset created:", event.resource.name)

  // Here you would typically:
  // 1. Update your database with the new asset
  // 2. Notify relevant users
  // 3. Trigger any automated workflows

  // Example: Send notification to project stakeholders
  if (event.resource.type === "file") {
    // await notifyProjectStakeholders(event.resource.project_id, 'New video uploaded')
  }
}

async function handleAssetUpdated(event: FrameIOWebhookEvent) {
  console.log("Asset updated:", event.resource.name)

  // Handle asset status changes (processing -> complete)
  // Update local database, notify users, etc.
}

async function handleCommentCreated(event: FrameIOWebhookEvent) {
  console.log("New comment created on asset:", event.resource.id)

  // Notify relevant users about new comments
  // Update comment counts, send email notifications, etc.
}

async function handleCommentUpdated(event: FrameIOWebhookEvent) {
  console.log("Comment updated:", event.resource.id)

  // Handle comment resolution, updates, etc.
}

async function handleProjectUpdated(event: FrameIOWebhookEvent) {
  console.log("Project updated:", event.resource.name)

  // Handle project metadata changes
}
