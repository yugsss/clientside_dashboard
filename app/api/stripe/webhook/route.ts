import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { neon } from "@neondatabase/serverless"
import { sendAccountCreationEmail } from "@/lib/email-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const sql = neon(process.env.DATABASE_URL!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription" && session.customer_email) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = subscription.items.data[0].price.id

          // Map price IDs to plan names
          const planMapping: Record<string, string> = {
            price_basic: "basic",
            price_monthly: "monthly",
            price_premium: "premium",
            price_ultimate: "ultimate",
          }

          const plan = planMapping[priceId] || "basic"

          // Create account creation token
          const token = crypto.randomUUID()
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

          // Store payment info and token
          await sql`
            INSERT INTO payment_tokens (
              email, 
              plan, 
              stripe_customer_id, 
              stripe_subscription_id, 
              token, 
              expires_at
            )
            VALUES (
              ${session.customer_email}, 
              ${plan}, 
              ${session.customer}, 
              ${session.subscription}, 
              ${token}, 
              ${expiresAt}
            )
          `

          // Send account creation email
          await sendAccountCreationEmail(session.customer_email, token, plan)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Update user's subscription status
        await sql`
          UPDATE users 
          SET subscription_status = ${subscription.status}
          WHERE stripe_customer_id = ${customerId}
        `
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Update user's subscription status
        await sql`
          UPDATE users 
          SET subscription_status = 'canceled'
          WHERE stripe_customer_id = ${customerId}
        `
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Update user's subscription status
        await sql`
          UPDATE users 
          SET subscription_status = 'active'
          WHERE stripe_customer_id = ${customerId}
        `
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Update user's subscription status
        await sql`
          UPDATE users 
          SET subscription_status = 'past_due'
          WHERE stripe_customer_id = ${customerId}
        `
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
