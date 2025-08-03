"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { LoginForm } from "@/components/auth/login-form"
import { LoadingScreen } from "@/components/loading-screen"

export default function HomePage() {
  const { user, loading, initialized, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) {
      checkAuth()
    }
  }, [initialized, checkAuth])

  useEffect(() => {
    if (initialized && !loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, initialized, router])

  if (loading || !initialized) {
    return <LoadingScreen />
  }

  if (user) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
