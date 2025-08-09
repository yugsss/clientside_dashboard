import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

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

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get line items to determine the product
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId)
    const lineItem = lineItems.data[0]

    let planId = 'basic'
    let planName = 'Basic Plan'

    if (lineItem?.price?.product) {
      const productId = typeof lineItem.price.product === 'string' 
        ? lineItem.price.product 
        : lineItem.price.product.id

      planId = productIdToPlan[productId as keyof typeof productIdToPlan] || 'basic'
      planName = planNames[planId as keyof typeof planNames]
    }

    const sessionData = {
      id: session.id,
      customerEmail: session.customer_details?.email || '',
      planId: planId,
      planName: planName,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: session.payment_status,
      created: session.created
    }

    return NextResponse.json(sessionData)
  } catch (error) {
    console.error('Error retrieving session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
