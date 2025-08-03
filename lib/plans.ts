export interface PlanDetails {
  id: string
  name: string
  price: number
  billing: "per_video" | "monthly"
  projectLimit: number | "unlimited"
  features: string[]
  turnaround: string
  revisions: number
  description: string
  badge?: string
}

export const planDetails: Record<string, PlanDetails> = {
  basic: {
    id: "basic",
    name: "Basic Plan",
    price: 45,
    billing: "per_video",
    projectLimit: 1,
    features: ["One professional video edit", "48-hour turnaround", "2 rounds of revisions"],
    turnaround: "48 hours",
    revisions: 2,
    description: "Perfect for occasional video editing needs",
  },
  monthly_pass: {
    id: "monthly_pass",
    name: "Monthly Pass Plan",
    price: 350,
    billing: "monthly",
    projectLimit: 10,
    features: ["10 videos per month", "48-hour turnaround per video", "2 rounds of revisions per video"],
    turnaround: "48 hours per video",
    revisions: 2,
    description: "Great for regular content creators",
    badge: "Save $100",
  },
  premium: {
    id: "premium",
    name: "Premium Plan",
    price: 500,
    billing: "per_video",
    projectLimit: 1,
    features: ["One premium edit", "3-4 day turnaround", "2 rounds of revisions"],
    turnaround: "3-4 days",
    revisions: 2,
    description: "High-end editing for important projects",
    badge: "Most Popular",
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate Plan",
    price: 999,
    billing: "monthly",
    projectLimit: "unlimited",
    features: ["One active project a day", "24-hour turnaround per edit", "Multiple rounds of revisions per video"],
    turnaround: "24 hours per edit",
    revisions: 999,
    description: "Complete video production solution",
    badge: "Our Best Offering",
  },
}

export function getPlanById(planId: string): PlanDetails | undefined {
  return planDetails[planId]
}

export const plans = Object.values(planDetails)
