import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest) {
  try {
    const frameioService = createFrameioService()
    const accounts = await frameioService.getAccounts()

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Failed to fetch Frame.io accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
