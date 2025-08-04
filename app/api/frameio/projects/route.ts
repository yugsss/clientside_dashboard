import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")
    const teamId = searchParams.get("teamId")

    const frameioService = createFrameioService()
    const projects = await frameioService.getProjects(accountId || undefined, teamId || undefined)

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Failed to fetch Frame.io projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamId, name, description, private: isPrivate } = body

    const frameioService = createFrameioService()
    const project = await frameioService.createProject(teamId, {
      name,
      description,
      private: isPrivate || false,
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Failed to create Frame.io project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
