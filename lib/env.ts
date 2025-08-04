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

  // Database Configuration (Supabase)
  SUPABASE_SUPABASE_URL: string
  SUPABASE_SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL: string
  SUPABASE_SUPABASE_ANON_KEY: string
  SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY_ANON_KEY: string
  SUPABASE_SUPABASE_SERVICE_ROLE_KEY: string

  // PostgreSQL Configuration
  DATABASE_URL: string
  POSTGRES_URL: string
  POSTGRES_PRISMA_URL: string
}

// Validate required environment variables
function validateEnv(): EnvironmentConfig {
  const requiredVars = ["FRAMEIO_API_KEY", "FRAMEIO_WEBHOOK_SECRET", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL"]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  return {
    // Frame.io
    FRAMEIO_API_KEY: process.env.FRAMEIO_API_KEY || process.env.NEXT_PUBLIC_FRAMEIO_API_KEY || "",
    FRAMEIO_WEBHOOK_SECRET: process.env.FRAMEIO_WEBHOOK_SECRET || "",
    FRAMEIO_API_URL: process.env.FRAMEIO_API_URL || "https://api.frame.io/v4",

    // Next.js
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",

    // App
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "EditLobby",
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

    // Supabase
    SUPABASE_SUPABASE_URL: process.env.SUPABASE_SUPABASE_URL || "",
    SUPABASE_NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || "",
    SUPABASE_SUPABASE_ANON_KEY: process.env.SUPABASE_SUPABASE_ANON_KEY || "",
    SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    SUPABASE_SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || "",

    // Database
    DATABASE_URL: process.env.DATABASE_URL!,
    POSTGRES_URL: process.env.POSTGRES_URL || process.env.DATABASE_URL!,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!,
  }
}

// Export validated environment configuration
export const env = validateEnv()

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

  return env.NEXTAUTH_URL
}
