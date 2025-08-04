import { type NextRequest, NextResponse } from "next/server"
import { createFrameioService } from "@/lib/frameio"

export async function GET(request: NextRequest, { params }: { params: { assetId: string } }) {
  try {
    const frameioService = createFrameioService()
    const asset = await frameioService.getAsset(params.assetId)

    return NextResponse.json({ asset })
  } catch (error) {
    console.error("Failed to fetch Frame.io asset:", error)
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { assetId: string } }) {
  try {
    const frameioService = createFrameioService()
    await frameioService.deleteAsset(params.assetId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete Frame.io asset:", error)
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}
