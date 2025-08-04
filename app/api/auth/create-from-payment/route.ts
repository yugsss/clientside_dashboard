import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json()

    if (!token || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify token and get payment info
    const [paymentToken] = await sql`
      SELECT * FROM payment_tokens 
      WHERE token = ${token} AND expires_at > NOW() AND used = false
    `

    if (!paymentToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${paymentToken.email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Account already exists for this email" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with paid plan
    const [user] = await sql`
      INSERT INTO users (
        name, 
        email, 
        password_hash, 
        plan, 
        stripe_customer_id, 
        stripe_subscription_id,
        subscription_status,
        created_at
      )
      VALUES (
        ${name}, 
        ${paymentToken.email}, 
        ${hashedPassword}, 
        ${paymentToken.plan}, 
        ${paymentToken.stripe_customer_id}, 
        ${paymentToken.stripe_subscription_id},
        'active',
        NOW()
      )
      RETURNING id, name, email, plan, created_at
    `

    // Mark token as used
    await sql`
      UPDATE payment_tokens 
      SET used = true 
      WHERE token = ${token}
    `

    // Create session
    const sessionToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Account creation error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
