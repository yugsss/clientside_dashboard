import webpush from "web-push"
import { notificationConfig } from "./env"

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export class NotificationService {
  constructor() {
    if (notificationConfig.vapidPublicKey && notificationConfig.vapidPrivateKey) {
      webpush.setVapidDetails(
        `mailto:${notificationConfig.vapidEmail}`,
        notificationConfig.vapidPublicKey,
        notificationConfig.vapidPrivateKey,
      )
    }
  }

  async sendPushNotification(
    subscription: PushSubscription,
    notification: {
      title: string
      body: string
      icon?: string
      badge?: string
      data?: any
    },
  ) {
    try {
      const payload = JSON.stringify(notification)

      await webpush.sendNotification(subscription, payload, {
        TTL: 60 * 60 * 24, // 24 hours
      })

      console.log("Push notification sent successfully")
    } catch (error) {
      console.error("Error sending push notification:", error)
      throw error
    }
  }

  async sendToMultipleUsers(
    subscriptions: PushSubscription[],
    notification: {
      title: string
      body: string
      icon?: string
      badge?: string
      data?: any
    },
  ) {
    const promises = subscriptions.map((subscription) =>
      this.sendPushNotification(subscription, notification).catch((error) => {
        console.error("Failed to send to subscription:", error)
        return null
      }),
    )

    const results = await Promise.allSettled(promises)
    const successful = results.filter((result) => result.status === "fulfilled").length
    const failed = results.length - successful

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`)

    return { successful, failed }
  }

  // Notification templates
  createProjectUpdateNotification(projectTitle: string, status: string) {
    return {
      title: "Project Update",
      body: `${projectTitle} status changed to ${status}`,
      icon: "/icons/project-icon.png",
      badge: "/icons/badge.png",
      data: {
        type: "project_update",
        projectTitle,
        status,
      },
    }
  }

  createCommentNotification(commenterName: string, projectTitle: string) {
    return {
      title: "New Comment",
      body: `${commenterName} added a comment to ${projectTitle}`,
      icon: "/icons/comment-icon.png",
      badge: "/icons/badge.png",
      data: {
        type: "comment_added",
        commenterName,
        projectTitle,
      },
    }
  }

  createVideoReadyNotification(projectTitle: string) {
    return {
      title: "Video Ready",
      body: `Your video for ${projectTitle} is ready for review`,
      icon: "/icons/video-icon.png",
      badge: "/icons/badge.png",
      data: {
        type: "video_ready",
        projectTitle,
      },
    }
  }

  createDeadlineReminderNotification(projectTitle: string, daysLeft: number) {
    return {
      title: "Deadline Reminder",
      body: `${projectTitle} is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
      icon: "/icons/deadline-icon.png",
      badge: "/icons/badge.png",
      data: {
        type: "deadline_reminder",
        projectTitle,
        daysLeft,
      },
    }
  }

  createChatMessageNotification(senderName: string, message: string) {
    return {
      title: `Message from ${senderName}`,
      body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      icon: "/icons/chat-icon.png",
      badge: "/icons/badge.png",
      data: {
        type: "chat_message",
        senderName,
        message,
      },
    }
  }
}

export const notificationService = new NotificationService()
