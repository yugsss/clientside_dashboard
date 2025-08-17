import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabase } from "@/lib/supabase"

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
        await handleAssetCreated(event.data)
        break
      case "comment.created":
        console.log("New comment created:", event.data)
        await handleCommentCreated(event.data)
        break
      case "comment.updated":
        console.log("Comment updated:", event.data)
        await handleCommentUpdated(event.data)
        break
      case "project.updated":
        console.log("Project updated:", event.data)
        await handleProjectUpdated(event.data)
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

async function handleAssetCreated(assetData: any) {
  try {
    // Find project by Frame.io project ID
    const { data: project } = await supabase
      .from("projects")
      .select("id, client_id, assigned_editor_id")
      .eq("frameio_project_id", assetData.parent_id)
      .single()

    if (project) {
      // Update project with asset information
      await supabase
        .from("projects")
        .update({
          frameio_asset_id: assetData.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      // Create notification for client
      await supabase.from("notifications").insert({
        user_id: project.client_id,
        title: "New Video Asset",
        message: `A new video asset "${assetData.name}" has been uploaded to your project`,
        type: "project_update",
        project_id: project.id,
        action_url: `/projects/${project.id}`,
      })
    }
  } catch (error) {
    console.error("Failed to handle asset created:", error)
  }
}

async function handleCommentCreated(commentData: any) {
  try {
    // Find project by Frame.io asset ID
    const { data: project } = await supabase
      .from("projects")
      .select("id, client_id, assigned_editor_id, assigned_qc_id")
      .eq("frameio_asset_id", commentData.asset_id)
      .single()

    if (project) {
      // Store comment in database
      await supabase.from("video_comments").insert({
        project_id: project.id,
        frameio_comment_id: commentData.id,
        user_id: commentData.author.id,
        content: commentData.text,
        timestamp: commentData.timestamp,
        type: "general",
        priority: "medium",
        resolved: false,
      })

      // Create notifications for relevant users
      const notifications = []
      if (project.client_id !== commentData.author.id) {
        notifications.push({
          user_id: project.client_id,
          title: "New Comment",
          message: `New comment added to your project by ${commentData.author.name}`,
          type: "project_update",
          project_id: project.id,
          action_url: `/projects/${project.id}`,
        })
      }

      if (project.assigned_editor_id && project.assigned_editor_id !== commentData.author.id) {
        notifications.push({
          user_id: project.assigned_editor_id,
          title: "New Comment",
          message: `New comment added to project by ${commentData.author.name}`,
          type: "project_update",
          project_id: project.id,
          action_url: `/projects/${project.id}`,
        })
      }

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications)
      }
    }
  } catch (error) {
    console.error("Failed to handle comment created:", error)
  }
}

async function handleCommentUpdated(commentData: any) {
  try {
    // Update comment in database
    await supabase
      .from("video_comments")
      .update({
        content: commentData.text,
        resolved: commentData.resolved || false,
        updated_at: new Date().toISOString(),
      })
      .eq("frameio_comment_id", commentData.id)
  } catch (error) {
    console.error("Failed to handle comment updated:", error)
  }
}

async function handleProjectUpdated(projectData: any) {
  try {
    // Update project status if needed
    await supabase
      .from("projects")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("frameio_project_id", projectData.id)
  } catch (error) {
    console.error("Failed to handle project updated:", error)
  }
}
