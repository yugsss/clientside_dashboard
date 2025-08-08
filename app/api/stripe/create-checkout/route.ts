import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// Your actual Stripe product configurations
const productConfigs = {
  basic: {
    productId: 'prod_SoYjLkZloARhuO',
    name: 'Basic Plan',
    description: '1 professional video edit with 48-hour turnaround and 2 revisions'
  },
  monthly_pass: {
    productId: 'prod_SoYotwJtNdEjcF', 
    name: 'Monthly Pass Plan',
    description: '10 videos per month with 48-hour turnaround and priority support'
  },
  premium: {
    productId: 'prod_SoYpR3YDLeFuk9',
    name: 'Premium Plan', 
    description: '1 premium edit with 3-4 day turnaround and advanced features'
  },
  ultimate: {
    productId: 'prod_SoYqkPWlBE4UUl',
    name: 'Ultimate Plan',
    description: '1 project per day with 24-hour turnaround and unlimited revisions'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { planId, customerEmail } = await request.json()

    if (!planId || !customerEmail) {
      return NextResponse.json(
        { error: 'Plan ID and customer email are required' },
        { status: 400 }
      )
    }

    const productConfig = productConfigs[planId as keyof typeof productConfigs]
    if (!productConfig) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Get the product and its default price from Stripe
    const product = await stripe.products.retrieve(productConfig.productId)
    
    if (!product.default_price) {
      return NextResponse.json(
        { error: 'Product has no default price configured' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: typeof product.default_price === 'string' 
            ? product.default_price 
            : product.default_price.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        planId: planId,
        productId: productConfig.productId,
        customerEmail: customerEmail
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
    })

    console.log('Checkout session created:', session.id, 'for plan:', planId)

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
