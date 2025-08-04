import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, endpoint } = body

    if (!userId || !endpoint) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock subscription removal
    console.log("Mock notification unsubscription:", { userId, endpoint })

    return NextResponse.json({
      success: true,
      message: "Subscription removed successfully",
    })
  } catch (error) {
    console.error("Unsubscription error:", error)
    return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 })
  }
}
