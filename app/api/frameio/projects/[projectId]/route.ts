import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const frameioService = createFrameioService()
    const project = await frameioService.getProject(params.projectId)

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Failed to fetch Frame.io project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const body = await request.json()

    const frameioService = createFrameioService()
    const project = await frameioService.updateProject(params.projectId, body)

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Failed to update Frame.io project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const frameioService = createFrameioService()
    await frameioService.deleteProject(params.projectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete Frame.io project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
