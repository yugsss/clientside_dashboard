// Environment variable configuration and validation
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL || "",

  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY:
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || "",

  // Authentication
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET || "your-jwt-secret-key",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Email (SMTP)
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number.parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "",

  // Frame.io
  FRAMEIO_API_KEY: process.env.FRAMEIO_API_KEY || process.env.NEXT_PUBLIC_FRAMEIO_API_KEY || "",
  FRAMEIO_API_URL: process.env.FRAMEIO_API_URL || "https://api.frame.io/v2",
  FRAMEIO_WEBHOOK_SECRET: process.env.FRAMEIO_WEBHOOK_SECRET || "",

  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "EditLobby",
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Push Notifications
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",

  // Node Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
}

// Validation function to check required environment variables
export function validateEnv() {
  const requiredVars = ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY", "NEXTAUTH_SECRET", "JWT_SECRET"]

  const missing = requiredVars.filter((varName) => !env[varName as keyof typeof env])

  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(", ")}`)
  }

  return missing.length === 0
}

// Helper functions for common configurations
export const supabaseConfig = {
  url: env.SUPABASE_URL,
  anonKey: env.SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
}

export const stripeConfig = {
  secretKey: env.STRIPE_SECRET_KEY,
  publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
}

export const smtpConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  from: env.SMTP_FROM,
}

export const frameioConfig = {
  apiKey: env.FRAMEIO_API_KEY,
  apiUrl: env.FRAMEIO_API_URL,
  webhookSecret: env.FRAMEIO_WEBHOOK_SECRET,
}

// Development helpers
export const isDevelopment = env.NODE_ENV === "development"
export const isProduction = env.NODE_ENV === "production"
