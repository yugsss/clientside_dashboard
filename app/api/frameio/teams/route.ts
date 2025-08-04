import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")

    const frameioService = createFrameioService()
    const teams = await frameioService.getTeams(accountId || undefined)

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Failed to fetch Frame.io teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
