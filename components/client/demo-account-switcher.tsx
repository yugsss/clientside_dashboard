"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Crown, Star, Zap, Target } from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"
import { demoUsers } from "../../lib/demo-data"

export function DemoAccountSwitcher() {
  const { user, switchDemoAccount } = useAuthStore()

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "ultimate":
        return <Crown className="h-4 w-4 text-orange-400" />
      case "premium":
        return <Star className="h-4 w-4 text-purple-400" />
      case "monthly_pass":
        return <Zap className="h-4 w-4 text-green-400" />
      default:
        return <Target className="h-4 w-4 text-blue-400" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "ultimate":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "premium":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "monthly_pass":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-purple-600 text-white text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-slate-400">{user.plan.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-slate-800 border-slate-700" align="end">
        <DropdownMenuLabel className="text-slate-300">Switch Demo Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        {demoUsers.map((demoUser) => (
          <DropdownMenuItem
            key={demoUser.id}
            className={`p-3 cursor-pointer hover:bg-slate-700 ${user.id === demoUser.id ? "bg-slate-700" : ""}`}
            onClick={() => switchDemoAccount(demoUser.id)}
          >
            <div className="flex items-center space-x-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={demoUser.avatar || "/placeholder.svg"} alt={demoUser.name} />
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                  {demoUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-white truncate">{demoUser.name}</p>
                  {getPlanIcon(demoUser.plan.id)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getPlanColor(demoUser.plan.id)}>{demoUser.plan.name}</Badge>
                  <span className="text-xs text-slate-400">
                    ${demoUser.plan.price}/{demoUser.plan.type === "monthly" ? "month" : "video"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {demoUser.projects?.length || 0} projects • {demoUser.company}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
