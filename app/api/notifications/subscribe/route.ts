import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, endpoint, keys } = body

    if (!userId || !endpoint) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mock subscription storage
    console.log("Mock notification subscription:", { userId, endpoint, keys })

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully",
    })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
