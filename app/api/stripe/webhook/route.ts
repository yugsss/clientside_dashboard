import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { env, debugEnvVars } from '@/lib/env'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Debug environment variables on startup
debugEnvVars()

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
})

const webhookSecret = env.STRIPE_WEBHOOK_SECRET

// Create email transporter
const transporter = nodemailer.createTransporter({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

// Product ID to plan mapping
const productIdToPlan = {
  'prod_SoYjLkZloARhuO': 'basic',
  'prod_SoYotwJtNdEjcF': 'monthly_pass', 
  'prod_SoYpR3YDLeFuk9': 'premium',
  'prod_SoYqkPWlBE4UUl': 'ultimate'
}

const planNames = {
  basic: 'Basic Plan',
  monthly_pass: 'Monthly Pass Plan',
  premium: 'Premium Plan',
  ultimate: 'Ultimate Plan'
}

export async function POST(request: NextRequest) {
  console.log('🔔 Stripe webhook received')
  
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified')
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('🔔 Processing webhook event:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('💳 Processing checkout session:', {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total
      })

      if (session.payment_status === 'paid' && session.customer_details?.email) {
        try {
          // Get line items to determine the product
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
          console.log('📋 Line items retrieved:', lineItems.data.length)
          
          const lineItem = lineItems.data[0]
          
          if (!lineItem?.price?.product) {
            console.error('❌ No product found in line items')
            return NextResponse.json({ error: 'No product found' }, { status: 400 })
          }

          const productId = typeof lineItem.price.product === 'string' 
            ? lineItem.price.product 
            : lineItem.price.product.id

          const planId = productIdToPlan[productId as keyof typeof productIdToPlan] || 'basic'
          const customerEmail = session.customer_details.email
          const amount = session.amount_total || 0

          console.log('📋 Payment details extracted:', {
            productId,
            planId,
            customerEmail,
            amount: amount / 100
          })

          // Generate secure signup token
          const signupToken = crypto.randomBytes(32).toString('hex')
          const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

          console.log('🔐 Generated signup token:', signupToken.substring(0, 10) + '...')

          // Test database connection first
          console.log('🔍 Testing database connection...')
          const { data: testData, error: testError } = await supabaseAdmin
            .from('users')
            .select('id')
            .limit(1)

          if (testError) {
            console.error('❌ Database connection test failed:', testError)
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
          }

          console.log('✅ Database connection successful')

          // Store payment record in database
          console.log('💾 Inserting payment record...')
          const { data: paymentRecord, error: dbError } = await supabaseAdmin
            .from('payment_records')
            .insert({
              stripe_session_id: session.id,
              customer_email: customerEmail,
              plan_id: planId,
              product_id: productId,
              amount: amount,
              signup_token: signupToken,
              token_expires_at: tokenExpiresAt.toISOString(),
              token_used: false,
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (dbError) {
            console.error('❌ Database insertion error:', {
              message: dbError.message,
              details: dbError.details,
              hint: dbError.hint,
              code: dbError.code
            })
            return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 })
          }

          console.log('✅ Payment record created successfully:', paymentRecord.id)

          // Send secure signup email
          const planName = planNames[planId as keyof typeof planNames]
          const signupUrl = `${env.NEXT_PUBLIC_APP_URL}/signup?token=${signupToken}`

          console.log('📧 Preparing to send email to:', customerEmail)

          const mailOptions = {
            from: env.SMTP_FROM,
            to: customerEmail,
            subject: `Welcome to EditLobby - Complete Your ${planName} Setup`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to EditLobby</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to EditLobby!</h1>
                  <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your payment has been processed successfully</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px;">
                  <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Payment Confirmed - ${planName}</h2>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18px;">Purchase Details:</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 500;">Plan:</td>
                          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${planName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 500;">Amount:</td>
                          <td style="padding: 8px 0; font-weight: bold; text-align: right;">$${(amount / 100).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 500;">Email:</td>
                          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${customerEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 500;">Session ID:</td>
                          <td style="padding: 8px 0; font-weight: bold; text-align: right; font-size: 12px;">${session.id}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <h3 style="color: #333; margin: 30px 0 15px 0;">Next Steps:</h3>
                    <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
                      <li style="margin-bottom: 10px;">Click the secure link below to create your account</li>
                      <li style="margin-bottom: 10px;">Set up your profile and preferences</li>
                      <li style="margin-bottom: 10px;">Upload your first project and provide requirements</li>
                      <li>Our team will start working on your video</li>
                    </ol>
                    
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${signupUrl}" 
                         style="background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                        Complete Account Setup
                      </a>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                      <p style="margin: 0; color: #856404; font-size: 14px; text-align: center;">
                        <strong>⏰ Important:</strong> This secure link expires in 24 hours for your security.
                      </p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #666; font-size: 12px;">
                        <strong>Debug Info:</strong><br>
                        Token: ${signupToken.substring(0, 10)}...<br>
                        Product ID: ${productId}<br>
                        Plan ID: ${planId}
                      </p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; color: #666; font-size: 14px;">
                    <p style="margin: 20px 0 10px 0;">
                      Need help? Reply to this email or contact our support team.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #999;">
                      © 2024 EditLobby. All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `
          }

          try {
            console.log('📧 Sending email...')
            await transporter.sendMail(mailOptions)
            console.log('✅ Signup email sent successfully to:', customerEmail)
          } catch (emailError) {
            console.error('❌ Failed to send signup email:', emailError)
            // Don't fail the webhook, but log the error
          }

          console.log('✅ Webhook processing completed successfully')
          return NextResponse.json({ 
            received: true, 
            paymentRecordId: paymentRecord.id,
            signupToken: signupToken.substring(0, 10) + '...'
          })

        } catch (error) {
          console.error('❌ Error processing payment:', error)
          return NextResponse.json({ 
            error: 'Payment processing failed', 
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      } else {
        console.log('⚠️ Payment not completed or no customer email:', {
          payment_status: session.payment_status,
          has_email: !!session.customer_details?.email
        })
        return NextResponse.json({ received: true, skipped: 'Payment not completed or no email' })
      }
    } else {
      console.log('ℹ️ Unhandled webhook event type:', event.type)
      return NextResponse.json({ received: true, skipped: 'Unhandled event type' })
    }

  } catch (error) {
    console.error('💥 Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
