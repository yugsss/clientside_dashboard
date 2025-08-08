import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { env, debugEnvVars } from '@/lib/env'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Stripe and Database Integration')
  
  // Debug environment variables
  debugEnvVars()
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      stripe_key_configured: !!env.STRIPE_SECRET_KEY,
      webhook_secret_configured: !!env.STRIPE_WEBHOOK_SECRET,
      supabase_url_configured: !!env.SUPABASE_URL,
      supabase_service_key_configured: !!env.SUPABASE_SERVICE_ROLE_KEY,
    },
    tests: {} as any
  }

  // Test 1: Stripe Connection
  try {
    console.log('🔍 Testing Stripe connection...')
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20'
    })
    
    // Test by retrieving account info
    const account = await stripe.accounts.retrieve()
    results.tests.stripe_connection = {
      success: true,
      account_id: account.id,
      country: account.country,
      currency: account.default_currency
    }
    console.log('✅ Stripe connection successful')
  } catch (error) {
    console.error('❌ Stripe connection failed:', error)
    results.tests.stripe_connection = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 2: Database Connection
  try {
    console.log('🔍 Testing database connection...')
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)

    if (error) throw error

    results.tests.database_connection = {
      success: true,
      message: 'Database connection successful'
    }
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    results.tests.database_connection = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 3: Payment Records Table Structure
  try {
    console.log('🔍 Testing payment_records table...')
    const { data, error } = await supabaseAdmin
      .from('payment_records')
      .select('*')
      .limit(1)

    results.tests.payment_records_table = {
      success: !error,
      message: error ? error.message : 'Table accessible',
      sample_count: data?.length || 0
    }
    console.log('✅ Payment records table test completed')
  } catch (error) {
    console.error('❌ Payment records table test failed:', error)
    results.tests.payment_records_table = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 4: Insert Test Payment Record
  try {
    console.log('🔍 Testing payment record insertion...')
    const testToken = 'test_token_' + Date.now()
    const { data, error } = await supabaseAdmin
      .from('payment_records')
      .insert({
        stripe_session_id: 'cs_test_' + Date.now(),
        customer_email: 'test@example.com',
        plan_id: 'basic',
        product_id: 'prod_SoYjLkZloARhuO',
        amount: 4500,
        signup_token: testToken,
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        token_used: false,
        status: 'test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    results.tests.payment_record_insertion = {
      success: true,
      record_id: data.id,
      message: 'Test record inserted successfully'
    }

    // Clean up test record
    await supabaseAdmin
      .from('payment_records')
      .delete()
      .eq('id', data.id)

    console.log('✅ Payment record insertion test successful')
  } catch (error) {
    console.error('❌ Payment record insertion test failed:', error)
    results.tests.payment_record_insertion = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 5: Verify Stripe Products
  try {
    console.log('🔍 Testing Stripe products...')
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20'
    })

    const productIds = [
      'prod_SoYjLkZloARhuO', // Basic
      'prod_SoYotwJtNdEjcF', // Monthly Pass
      'prod_SoYpR3YDLeFuk9', // Premium
      'prod_SoYqkPWlBE4UUl'  // Ultimate
    ]

    const productTests = []
    for (const productId of productIds) {
      try {
        const product = await stripe.products.retrieve(productId)
        productTests.push({
          id: productId,
          name: product.name,
          active: product.active,
          has_default_price: !!product.default_price,
          success: true
        })
      } catch (error) {
        productTests.push({
          id: productId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    results.tests.stripe_products = {
      success: productTests.every(p => p.success),
      products: productTests
    }
    console.log('✅ Stripe products test completed')
  } catch (error) {
    console.error('❌ Stripe products test failed:', error)
    results.tests.stripe_products = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  const allTestsPassed = Object.values(results.tests).every((test: any) => test.success)
  
  return NextResponse.json({
    ...results,
    overall_status: allTestsPassed ? 'ALL_TESTS_PASSED' : 'SOME_TESTS_FAILED',
    recommendations: allTestsPassed ? [] : [
      'Check environment variables configuration',
      'Verify Stripe account and API keys',
      'Ensure Supabase database is accessible',
      'Run the SQL migration script if payment_records table issues persist'
    ]
  })
}
