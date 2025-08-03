// Server-side environment variables
export const serverConfig = {
  jwtSecret: process.env.JWT_SECRET || "dev-jwt-secret-change-in-production",
  sessionSecret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
  frameioApiKey: process.env.FRAMEIO_API_KEY || "7233b6e913af4f2e8a99d3eee444f0c8",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidEmail: process.env.VAPID_EMAIL,
  websocketPort: Number.parseInt(process.env.WEBSOCKET_PORT || "3001"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
}

// Client-side environment variables
export const clientConfig = {
  frameioApiKey: process.env.NEXT_PUBLIC_FRAMEIO_API_KEY || "7233b6e913af4f2e8a99d3eee444f0c8",
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001",
}

// Database configuration
export const databaseConfig = {
  url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://localhost:5432/videoedit_dev",
  maxConnections: Number.parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
}

// Auth configuration
export const authConfig = {
  jwtSecret: serverConfig.jwtSecret,
  sessionSecret: serverConfig.sessionSecret,
  googleClientId: serverConfig.googleClientId,
  googleClientSecret: serverConfig.googleClientSecret,
  tokenExpiry: "15m",
  refreshTokenExpiry: "7d",
}

// Frame.io configuration
export const frameioConfig = {
  apiKey: serverConfig.frameioApiKey || clientConfig.frameioApiKey,
  baseUrl: process.env.FRAMEIO_API_URL || "https://api.frame.io/v4",
  webhookSecret: process.env.FRAMEIO_WEBHOOK_SECRET || "p8e-Mgi7xeMg6jCCS4vPGZDa-kSBQO4JuhgB",
}

// Notification configuration
export const notificationConfig = {
  vapidPublicKey: clientConfig.vapidPublicKey,
  vapidPrivateKey: serverConfig.vapidPrivateKey,
  vapidEmail: serverConfig.vapidEmail,
}

// Validate required environment variables in production
export function validateEnvironment() {
  if (process.env.NODE_ENV === "production") {
    const required = ["JWT_SECRET", "SESSION_SECRET", "DATABASE_URL"]

    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    }
  }

  // Warn about missing optional variables
  const optional = ["GOOGLE_CLIENT_ID", "NEXT_PUBLIC_VAPID_PUBLIC_KEY"]

  const missingOptional = optional.filter((key) => !process.env[key])

  if (missingOptional.length > 0) {
    console.warn(`⚠️ Optional environment variables not set: ${missingOptional.join(", ")}`)
    console.warn("Some features may use mock data or be disabled.")
  }

  // Frame.io is now configured with fallback values
  console.log("✅ Frame.io API configured with provided credentials")
}

// Initialize environment validation
if (typeof window === "undefined") {
  validateEnvironment()
}
