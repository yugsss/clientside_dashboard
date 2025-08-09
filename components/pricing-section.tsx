'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star, Crown, Zap } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 45,
    originalPrice: null,
    badge: null,
    icon: CheckCircle,
    description: 'Perfect for occasional video editing needs',
    features: [
      '1 professional video edit',
      '48-hour turnaround',
      '2 rounds of revisions',
      'Frame.io review system',
      'Quality control included',
      'Basic color correction',
      'Audio enhancement'
    ],
    popular: false
  },
  {
    id: 'monthly_pass',
    name: 'Monthly Pass',
    price: 350,
    originalPrice: 450,
    badge: 'Save $100',
    icon: Star,
    description: 'Great for regular content creators',
    features: [
      '10 videos per month',
      '48-hour turnaround per video',
      '2 rounds of revisions per video',
      'Priority support',
      'Dedicated project manager',
      'Advanced color grading',
      'Motion graphics included',
      'Custom thumbnails'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 500,
    originalPrice: null,
    badge: 'Most Popular',
    icon: Crown,
    description: 'High-end editing for important projects',
    features: [
      '1 premium video edit',
      '3-4 day turnaround',
      '2 rounds of revisions',
      'Advanced color grading',
      'Motion graphics & animations',
      'Custom music selection',
      'Professional voice-over',
      'Multiple format delivery'
    ],
    popular: false
  },
  {
    id: 'ultimate',
    name: 'Ultimate Plan',
    price: 999,
    originalPrice: null,
    badge: 'Best Value',
    icon: Zap,
    description: 'Complete video production solution',
    features: [
      '1 active project per day',
      '24-hour turnaround per edit',
      'Unlimited revisions',
      'Dedicated editing team',
      '24/7 priority support',
      'Advanced motion graphics',
      'Professional scriptwriting',
      'Multi-camera editing',
      'Live streaming setup'
    ],
    popular: false
  }
]

export default function PricingSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (planId: string) => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(planId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          customerEmail: email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional video editing services tailored to your needs. 
            From single projects to unlimited monthly editing.
          </p>
        </div>

        {/* Email Input */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex flex-col space-y-2">
            <Input
              type="email"
              placeholder="Enter your email to get started"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-center text-lg py-3"
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-xl scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge 
                      variant={plan.popular ? "default" : "secondary"}
                      className={`px-3 py-1 ${
                        plan.popular 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      plan.popular ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${plan.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading === plan.id || !email}
                    className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Get Started - $${plan.price}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            All plans include Frame.io review system, quality control, and professional editing
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ Secure Payment</span>
            <span>✓ 24-Hour Setup</span>
            <span>✓ Professional Quality</span>
            <span>✓ Satisfaction Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  )
}
