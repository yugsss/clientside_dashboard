// Environment variables validation and types
export interface EnvironmentConfig {
  // Frame.io Configuration
  FRAMEIO_API_KEY: string
  FRAMEIO_WEBHOOK_SECRET: string
  FRAMEIO_API_URL: string

  // Next.js Configuration
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string

  // Application Configuration
  NEXT_PUBLIC_APP_NAME: string
  NEXT_PUBLIC_APP_VERSION: string
  NEXT_PUBLIC_APP_URL: string

  // Supabase Configuration
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string

  // Stripe Configuration
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string

  // JWT Secret for additional auth
  JWT_SECRET: string

  // Email Configuration
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_FROM: string
  SMTP_PASS: string
}

// Validate required environment variables
const requiredEnvVars = [
  "JWT_SECRET", 
  "SUPABASE_URL", 
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS"
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Missing environment variable: ${envVar}`)
  }
}

// Export validated environment configuration
export const env = {
  // Supabase - Using the correct environment variable names from your setup
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret-key-for-development",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "fallback-nextauth-secret",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // Frame.io
  FRAMEIO_API_KEY: process.env.FRAMEIO_API_KEY || "",
  FRAMEIO_API_URL: process.env.FRAMEIO_API_URL || "https://api.frame.io/v2",
  FRAMEIO_WEBHOOK_SECRET: process.env.FRAMEIO_WEBHOOK_SECRET || "",

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || "587",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_FROM: process.env.SMTP_FROM || "",
  SMTP_PASS: process.env.SMTP_PASS || "",

  // App
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "EditLobby",
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Node Environment
  NODE_ENV: process.env.NODE_ENV || "development",
}

// Helper functions
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return env.NEXT_PUBLIC_APP_URL
}

// Auth configuration
export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  sessionMaxAge: 60 * 60 * 24 * 7, // 7 days
  cookieName: "session",
}

// Supabase configuration
export const supabaseConfig = {
  url: env.SUPABASE_URL,
  anonKey: env.SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
}

// Frame.io configuration
export const frameioConfig = {
  apiKey: env.FRAMEIO_API_KEY,
  webhookSecret: env.FRAMEIO_WEBHOOK_SECRET,
  apiUrl: env.FRAMEIO_API_URL,
}

// Stripe configuration
export const stripeConfig = {
  secretKey: env.STRIPE_SECRET_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
}

// Email configuration
export const emailConfig = {
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  user: env.SMTP_USER,
  from: env.SMTP_FROM,
  pass: env.SMTP_PASS,
}

// Debug function to check environment variables
export function debugEnvVars() {
  console.log("🔍 Environment Variables Check:")
  console.log("SUPABASE_URL:", env.SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_ANON_KEY:", env.SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_SERVICE_ROLE_KEY:", env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")
  console.log("STRIPE_SECRET_KEY:", env.STRIPE_SECRET_KEY ? "✅ Set" : "❌ Missing")
  console.log("STRIPE_WEBHOOK_SECRET:", env.STRIPE_WEBHOOK_SECRET ? "✅ Set" : "❌ Missing")
  console.log("SMTP_HOST:", env.SMTP_HOST ? "✅ Set" : "❌ Missing")
  console.log("SMTP_USER:", env.SMTP_USER ? "✅ Set" : "❌ Missing")
  console.log("SMTP_PASS:", env.SMTP_PASS ? "✅ Set" : "❌ Missing")
}
