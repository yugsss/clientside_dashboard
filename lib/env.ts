// Environment variable configuration and validation
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL || "",

  // Supabase - Fixed environment variable mapping to use available variables
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

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
  FRAMEIO_API_KEY: process.env.FRAMEIO_API_KEY || "",
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
  const requiredVars = [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXTAUTH_SECRET",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "FRAMEIO_API_KEY",
  ]

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

// Auth configuration
export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  sessionMaxAge: 60 * 60 * 24 * 7, // 7 days
  cookieName: "session",
  nextAuthSecret: env.NEXTAUTH_SECRET,
  nextAuthUrl: env.NEXTAUTH_URL,
}

// Notification configuration
export const notificationConfig = {
  vapidPublicKey: env.VAPID_PUBLIC_KEY,
  enablePushNotifications: !!env.VAPID_PUBLIC_KEY,
  adminEmail: env.ADMIN_EMAIL,
}

// WebSocket configuration
export const websocketConfig = {
  enabled: env.NODE_ENV === "production",
  port: 3001,
  cors: {
    origin: env.APP_URL,
    methods: ["GET", "POST"],
  },
}

// Development helpers
export const isDevelopment = env.NODE_ENV === "development"
export const isProduction = env.NODE_ENV === "production"

// Debug function to check environment variables
export function debugEnvVars() {
  console.log("🔍 Environment Variables Check:")
  console.log("DATABASE_URL:", env.DATABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_URL:", env.SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_ANON_KEY:", env.SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_SERVICE_ROLE_KEY:", env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")
  console.log("NEXTAUTH_SECRET:", env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing")
  console.log("JWT_SECRET:", env.JWT_SECRET ? "✅ Set" : "❌ Missing")
  console.log("STRIPE_SECRET_KEY:", env.STRIPE_SECRET_KEY ? "✅ Set" : "❌ Missing")
  console.log("STRIPE_WEBHOOK_SECRET:", env.STRIPE_WEBHOOK_SECRET ? "✅ Set" : "❌ Missing")
  console.log("SMTP_HOST:", env.SMTP_HOST ? "✅ Set" : "❌ Missing")
  console.log("SMTP_USER:", env.SMTP_USER ? "✅ Set" : "❌ Missing")
  console.log("SMTP_PASS:", env.SMTP_PASS ? "✅ Set" : "❌ Missing")
  console.log("FRAMEIO_API_KEY:", env.FRAMEIO_API_KEY ? "✅ Set" : "❌ Missing")
  console.log("VAPID_PUBLIC_KEY:", env.VAPID_PUBLIC_KEY ? "✅ Set" : "❌ Missing")

  const isValid = validateEnv()
  console.log(`\n🎯 Overall Status: ${isValid ? "✅ Ready for deployment" : "❌ Missing required variables"}`)
}
