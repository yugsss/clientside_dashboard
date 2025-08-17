import { createClient } from "@supabase/supabase-js"
import { env } from "./env"

// Use the transaction pooler URL for serverless functions
const supabaseUrl = env.SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-application-name": "editlobby-api",
    },
  },
})

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  }
  return supabaseClient
}

export const supabase = supabaseAdmin

// Types remain the same...
export interface User {
  id: string
  email: string
  name: string
  password_hash: string
  role: "client" | "employee" | "admin" | "qc"
  company?: string
  avatar?: string
  plan_id: string
  plan_name: string
  plan_price: number
  plan_type: "monthly" | "per-video"
  plan_features: string[]
  active_projects: number
  max_projects: number
  total_spent: number
  member_since: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: "pending" | "assigned" | "in_progress" | "qc_review" | "client_review" | "completed" | "cancelled"
  progress: number
  client_id: string
  assigned_editor_id?: string
  assigned_qc_id?: string
  frameio_project_id?: string
  frameio_asset_id?: string
  revisions: number
  max_revisions: number
  due_date?: string
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "project_update"
  is_read: boolean
  action_url?: string
  project_id?: string
  created_at: string
}

export interface VideoComment {
  id: string
  project_id: string
  user_id: string
  content: string
  timestamp?: number
  type: "general" | "revision" | "qc_feedback"
  priority: "low" | "medium" | "high" | "urgent"
  resolved: boolean
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: "light" | "dark"
  notifications_enabled: boolean
  email_notifications: boolean
  auto_play_videos: boolean
  preferred_quality: "sd" | "hd" | "4k"
  created_at: string
  updated_at: string
}

export interface ProjectActivity {
  id: string
  project_id: string
  user_id: string
  action:
    | "created"
    | "assigned"
    | "progress_updated"
    | "submitted_for_qc"
    | "qc_approved"
    | "qc_rejected"
    | "submitted_for_review"
    | "client_approved"
    | "client_rejected"
  details: string
  metadata?: any
  created_at: string
}
