import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const frameioService = createFrameioService()
    const analytics = await frameioService.getProjectAnalytics(params.projectId)

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Failed to fetch Frame.io project analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
