"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "../stores/auth-store"

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  })
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported("Notification" in window && "serviceWorker" in navigator)

    if ("Notification" in window) {
      const currentPermission = Notification.permission
      setPermission({
        granted: currentPermission === "granted",
        denied: currentPermission === "denied",
        default: currentPermission === "default",
      })
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) {
      throw new Error("Notifications are not supported in this browser")
    }

    const result = await Notification.requestPermission()

    setPermission({
      granted: result === "granted",
      denied: result === "denied",
      default: result === "default",
    })

    return result === "granted"
  }

  const subscribeToPush = async () => {
    if (!permission.granted) {
      const granted = await requestPermission()
      if (!granted) {
        throw new Error("Notification permission denied")
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      setSubscription(pushSubscription)

      // Send subscription to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: pushSubscription.toJSON(),
          userId: user?.id,
        }),
      })

      return pushSubscription
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error)
      throw error
    }
  }

  const unsubscribeFromPush = async () => {
    if (!subscription) return

    try {
      await subscription.unsubscribe()
      setSubscription(null)

      // Remove subscription from server
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      })
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error)
      throw error
    }
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!permission.granted) return

    return new Notification(title, {
      icon: "/icons/notification-icon.png",
      badge: "/icons/badge.png",
      ...options,
    })
  }

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification,
  }
}
