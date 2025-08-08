import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Validating signup token:', token.substring(0, 10) + '...')

    // Get payment record by token
    const { data: paymentRecord, error } = await supabaseAdmin
      .from('payment_records')
      .select('*')
      .eq('signup_token', token)
      .single()

    if (error) {
      console.error('❌ Error finding payment record:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Check if token is already used
    if (paymentRecord.token_used) {
      console.log('❌ Token already used')
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(paymentRecord.token_expires_at)
    const now = new Date()
    
    if (now > expiresAt) {
      console.log('❌ Token expired')
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', paymentRecord.customer_email)
      .single()

    if (existingUser) {
      console.log('❌ User already exists')
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    console.log('✅ Token validation successful')

    // Return payment record details for signup form
    return NextResponse.json({
      valid: true,
      paymentRecord: {
        id: paymentRecord.id,
        customerEmail: paymentRecord.customer_email,
        planId: paymentRecord.plan_id,
        productId: paymentRecord.product_id,
        amount: paymentRecord.amount,
        stripeSessionId: paymentRecord.stripe_session_id
      }
    })

  } catch (error) {
    console.error('💥 Token validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
