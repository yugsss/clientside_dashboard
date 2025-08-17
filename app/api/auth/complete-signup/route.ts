import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json()

    if (!token || !name || !password) {
      return NextResponse.json({ error: "Token, name, and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Validate token and get payment record
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from("payment_records")
      .select("*")
      .eq("signup_token", token)
      .single()

    if (paymentError || !paymentRecord) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 })
    }

    if (paymentRecord.token_used) {
      return NextResponse.json({ error: "Token has already been used" }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(paymentRecord.token_expires_at)
    if (now > expiresAt) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    const { data: planDetails } = await supabaseAdmin
      .from("stripe_products")
      .select("*, stripe_prices(*)")
      .eq("id", paymentRecord.plan_id)
      .single()

    const { user, tokens } = await authService.register({
      email: paymentRecord.customer_email,
      name,
      password,
      role: "client",
      planId: paymentRecord.plan_id,
      planName: planDetails?.name || "Basic Plan",
      planPrice: planDetails?.stripe_prices?.[0]?.unit_amount || 4500,
      planType: planDetails?.metadata?.type === "monthly" ? "monthly" : "per-video",
      planFeatures: planDetails?.features || [
        "Professional video editing",
        "Quality control review",
        "Frame.io integration",
      ],
    })

    const { error: tokenError } = await supabaseAdmin
      .from("payment_records")
      .update({
        token_used: true,
        updated_at: new Date().toISOString(),
      })
      .eq("signup_token", token)

    if (tokenError) {
      console.error("Failed to mark token as used:", tokenError)
    }

    await supabaseAdmin.from("user_settings").insert({
      user_id: user.id,
      theme: "dark",
      notifications_enabled: true,
      email_notifications: true,
      auto_play_videos: true,
      preferred_quality: "hd",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: "Welcome to Edit Lobby!",
      message: `Your ${user.plan_name} account has been created successfully. You can now start creating your first video editing project.`,
      type: "info",
      is_read: false,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        planId: user.plan_id,
        planName: user.plan_name,
      },
      tokens,
    })
  } catch (error) {
    console.error("Signup completion error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Account creation failed" },
      { status: 500 },
    )
  }
}
