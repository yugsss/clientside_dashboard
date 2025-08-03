"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "../../stores/auth-store"
import { DemoAccountSwitcher } from "../client/demo-account-switcher"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid credentials. Use any demo email with password 'demo123'")
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/editlobby-logo.jpg" alt="Edit Lobby" className="h-12 w-12 rounded object-cover" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to Edit Lobby</CardTitle>
          <CardDescription className="text-slate-400">Sign in to your video collaboration dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <Alert className="bg-red-900/20 border-red-600/30">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Separator className="bg-slate-700" />

          <div className="space-y-3">
            <p className="text-sm text-slate-400 text-center">Try our demo accounts:</p>
            <DemoAccountSwitcher />
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Demo password: <code className="bg-slate-700 px-1 rounded">demo123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
