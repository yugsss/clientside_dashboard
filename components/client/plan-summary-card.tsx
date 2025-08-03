"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Crown, Calendar, TrendingUp, CheckCircle } from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"
import { getPlanById } from "../../lib/plans"

export function PlanSummaryCard() {
  const { user } = useAuthStore()

  if (!user) return null

  const planDetails = getPlanById(user.plan.id)
  const isMonthlyPlan = planDetails?.billing === "monthly"
  const usagePercentage =
    isMonthlyPlan && user.plan.projectLimit !== "unlimited"
      ? (user.plan.projectsUsed / (user.plan.projectLimit as number)) * 100
      : 0

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "basic":
        return "from-blue-500 to-blue-600"
      case "monthly_pass":
        return "from-green-500 to-green-600"
      case "premium":
        return "from-purple-500 to-purple-600"
      case "ultimate":
        return "from-orange-500 to-orange-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const canRequestNewProject = user.plan.canRequestNewProject && user.plan.activeProjects === 0

  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${getPlanColor(user.plan.id)}`} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(user.plan.id)}`}>
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>{user.plan.name} Plan</span>
                {planDetails?.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {planDetails.badge}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-slate-400 text-sm mt-1">
                ${planDetails?.price}
                {planDetails?.billing === "monthly" ? "/month" : "/video"}
              </p>
            </div>
          </div>

          {!canRequestNewProject && user.plan.projectLimit !== "unlimited" && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Progress for Monthly Plans */}
        {isMonthlyPlan && user.plan.projectLimit !== "unlimited" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Projects Used This Month</span>
              <span className="text-white font-medium">
                {user.plan.projectsUsed}/{user.plan.projectLimit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="mr-1 h-3 w-3" />
              Resets on{" "}
              {user.plan.monthlyReset ? new Date(user.plan.monthlyReset).toLocaleDateString() : "1st of next month"}
            </div>
          </div>
        )}

        {/* Unlimited Plan Display */}
        {user.plan.projectLimit === "unlimited" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Projects This Month</span>
              <span className="text-white font-medium flex items-center">
                {user.plan.projectsUsed}
                <span className="ml-1 text-orange-400">∞</span>
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="mr-1 h-3 w-3" />
              Unlimited projects • Resets{" "}
              {user.plan.monthlyReset ? new Date(user.plan.monthlyReset).toLocaleDateString() : "monthly"}
            </div>
          </div>
        )}

        {/* Active Projects Status */}
        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${user.plan.activeProjects > 0 ? "bg-yellow-500" : "bg-green-500"}`}
            />
            <span className="text-sm text-slate-300">
              {user.plan.activeProjects > 0 ? "Active Project" : "Ready for New Project"}
            </span>
          </div>
          <div className="text-sm text-white font-medium">{user.plan.activeProjects}/1</div>
        </div>

        {/* Action Button */}
        <Button
          className={`w-full ${
            canRequestNewProject
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
          disabled={!canRequestNewProject}
        >
          {canRequestNewProject ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Request New Project
            </>
          ) : user.plan.activeProjects > 0 ? (
            "Complete Current Project First"
          ) : user.plan.projectLimit !== "unlimited" && user.plan.projectsUsed >= (user.plan.projectLimit as number) ? (
            "Monthly Limit Reached"
          ) : (
            "Cannot Request New Project"
          )}
        </Button>

        {/* Plan Features */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">Plan includes:</p>
          <div className="grid grid-cols-1 gap-1">
            {planDetails?.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-xs text-slate-400">
                <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
