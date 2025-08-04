import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const projectId = searchParams.get("projectId")

    if (!query) {
      return NextResponse.json({ error: "query parameter 'q' is required" }, { status: 400 })
    }

    const frameioService = createFrameioService()
    const results = await frameioService.search(query, projectId || undefined)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Failed to search Frame.io:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}
