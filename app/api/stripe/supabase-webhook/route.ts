import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Processing Stripe event:', event.type)

    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      case 'product.created':
        await handleProductCreated(event.data.object as Stripe.Product)
        break

      case 'product.updated':
        await handleProductUpdated(event.data.object as Stripe.Product)
        break

      case 'price.created':
        await handlePriceCreated(event.data.object as Stripe.Price)
        break

      case 'price.updated':
        await handlePriceUpdated(event.data.object as Stripe.Price)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  const { error } = await supabaseAdmin
    .from('stripe_customers')
    .insert({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      created: new Date(customer.created * 1000).toISOString()
    })

  if (error) {
    console.error('Error creating customer:', error)
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  const { error } = await supabaseAdmin
    .from('stripe_customers')
    .update({
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      updated: new Date().toISOString()
    })
    .eq('id', customer.id)

  if (error) {
    console.error('Error updating customer:', error)
  }
}

async function handleProductCreated(product: Stripe.Product) {
  const { error } = await supabaseAdmin
    .from('stripe_products')
    .insert({
      id: product.id,
      active: product.active,
      name: product.name,
      description: product.description,
      image: product.images?.[0],
      metadata: product.metadata,
      created: new Date(product.created * 1000).toISOString()
    })

  if (error) {
    console.error('Error creating product:', error)
  }
}

async function handleProductUpdated(product: Stripe.Product) {
  const { error } = await supabaseAdmin
    .from('stripe_products')
    .update({
      active: product.active,
      name: product.name,
      description: product.description,
      image: product.images?.[0],
      metadata: product.metadata,
      updated: new Date().toISOString()
    })
    .eq('id', product.id)

  if (error) {
    console.error('Error updating product:', error)
  }
}

async function handlePriceCreated(price: Stripe.Price) {
  const { error } = await supabaseAdmin
    .from('stripe_prices')
    .insert({
      id: price.id,
      product_id: typeof price.product === 'string' ? price.product : price.product.id,
      active: price.active,
      currency: price.currency,
      unit_amount: price.unit_amount,
      type: price.type,
      interval: price.recurring?.interval,
      interval_count: price.recurring?.interval_count,
      metadata: price.metadata,
      created: new Date(price.created * 1000).toISOString()
    })

  if (error) {
    console.error('Error creating price:', error)
  }
}

async function handlePriceUpdated(price: Stripe.Price) {
  const { error } = await supabaseAdmin
    .from('stripe_prices')
    .update({
      active: price.active,
      metadata: price.metadata,
      updated: new Date().toISOString()
    })
    .eq('id', price.id)

  if (error) {
    console.error('Error updating price:', error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Handle one-time payments
  if (session.mode === 'payment') {
    // Your existing payment handling logic
    console.log('One-time payment completed:', session.id)
  }
  
  // Handle subscription creation
  if (session.mode === 'subscription' && session.subscription) {
    console.log('Subscription created:', session.subscription)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('stripe_subscriptions')
    .insert({
      id: subscription.id,
      customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      quantity: subscription.items.data[0]?.quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      metadata: subscription.metadata,
      created: new Date(subscription.created * 1000).toISOString()
    })

  if (error) {
    console.error('Error creating subscription:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('stripe_subscriptions')
    .update({
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      quantity: subscription.items.data[0]?.quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      metadata: subscription.metadata,
      updated: new Date().toISOString()
    })
    .eq('id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date().toISOString(),
      updated: new Date().toISOString()
    })
    .eq('id', subscription.id)

  if (error) {
    console.error('Error deleting subscription:', error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabaseAdmin
    .from('stripe_payment_intents')
    .upsert({
      id: paymentIntent.id,
      customer_id: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer?.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
      updated: new Date().toISOString()
    })

  if (error) {
    console.error('Error updating payment intent:', error)
  }
}
