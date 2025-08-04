import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId")

    if (!parentId) {
      return NextResponse.json({ error: "parentId is required" }, { status: 400 })
    }

    const frameioService = createFrameioService()
    const assets = await frameioService.getAssets(parentId)

    return NextResponse.json({ assets })
  } catch (error) {
    console.error("Failed to fetch Frame.io assets:", error)
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
  }
}
