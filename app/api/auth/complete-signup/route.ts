import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json()

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: 'Token, name, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const db = DatabaseService.getInstance()
    
    // Validate token again
    const paymentRecord = await db.getPaymentByToken(token)
    
    if (!paymentRecord) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    if (paymentRecord.tokenUsed) {
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(paymentRecord.tokenExpiresAt)
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(paymentRecord.customerEmail)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Create the user
    const user = await db.createUser({
      email: paymentRecord.customerEmail,
      name,
      password,
      role: 'client',
      planId: paymentRecord.planId,
      stripeSessionId: paymentRecord.stripeSessionId
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Mark token as used
    const tokenMarked = await db.markTokenAsUsed(token)
    if (!tokenMarked) {
      console.error('Failed to mark token as used, but user was created')
    }

    // Create default user settings
    await db.createDefaultUserSettings(user.id)

    // Create welcome notification
    await db.createNotification({
      user_id: user.id,
      title: 'Welcome to EditLobby!',
      message: `Your account has been created successfully. You can now start uploading your first project.`,
      type: 'info',
      is_read: false
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planId: user.plan_id
      }
    })
  } catch (error) {
    console.error('Signup completion error:', error)
    return NextResponse.json(
      { error: 'Account creation failed' },
      { status: 500 }
    )
  }
}
