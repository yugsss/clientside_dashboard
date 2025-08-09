import {
  supabaseAdmin,
  type User,
  type Project,
  type Notification,
  type VideoComment,
  type UserSettings,
  type ProjectActivity,
} from "./supabase"
import bcrypt from "bcryptjs"

export interface EditorTask {
  id: string
  project_id: string
  editor_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ProjectAssignment {
  id: string
  project_id: string
  assigned_by: string
  assigned_to: string
  role_type: 'editor' | 'qc'
  assigned_at: string
  is_active: boolean
}

export interface PaymentRecord {
  id: string
  stripeSessionId: string
  customerEmail: string
  planId: string
  amount: number
  signupToken: string
  tokenExpiresAt: string
  tokenUsed: boolean
  status: string
  createdAt: string
}

export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testing database connection...")
      const { data, error } = await supabaseAdmin.from("users").select("id").limit(1)

      if (error) {
        console.error("❌ Database connection test failed:", error.message)
        return false
      }

      console.log("✅ Database connection successful")
      return true
    } catch (error) {
      console.error("💥 Database connection test error:", error)
      return false
    }
  }

  // Payment and signup token operations
  async createPaymentRecord(data: {
    stripeSessionId: string
    customerEmail: string
    planId: string
    amount: number
    signupToken: string
    tokenExpiresAt: string
  }): Promise<PaymentRecord | null> {
    try {
      console.log("💳 Creating payment record for:", data.customerEmail)
      
      const { data: record, error } = await supabaseAdmin
        .from("payment_records")
        .insert([{
          stripe_session_id: data.stripeSessionId,
          customer_email: data.customerEmail,
          plan_id: data.planId,
          amount: data.amount,
          signup_token: data.signupToken,
          token_expires_at: data.tokenExpiresAt,
          token_used: false,
          status: 'completed',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error("❌ Error creating payment record:", error.message)
        return null
      }

      console.log("✅ Payment record created:", record.id)
      return {
        id: record.id,
        stripeSessionId: record.stripe_session_id,
        customerEmail: record.customer_email,
        planId: record.plan_id,
        amount: record.amount,
        signupToken: record.signup_token,
        tokenExpiresAt: record.token_expires_at,
        tokenUsed: record.token_used,
        status: record.status,
        createdAt: record.created_at
      }
    } catch (error) {
      console.error("💥 Error creating payment record:", error)
      return null
    }
  }

  async getPaymentByToken(token: string): Promise<PaymentRecord | null> {
    try {
      console.log("🔍 Looking up payment by token:", token.substring(0, 10) + "...")
      
      const { data, error } = await supabaseAdmin
        .from("payment_records")
        .select("*")
        .eq("signup_token", token)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("❌ Payment record not found for token")
          return null
        }
        console.error("❌ Error getting payment by token:", error.message)
        return null
      }

      console.log("✅ Payment record found:", data.id)
      return {
        id: data.id,
        stripeSessionId: data.stripe_session_id,
        customerEmail: data.customer_email,
        planId: data.plan_id,
        amount: data.amount,
        signupToken: data.signup_token,
        tokenExpiresAt: data.token_expires_at,
        tokenUsed: data.token_used,
        status: data.status,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error("💥 Error getting payment by token:", error)
      return null
    }
  }

  async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      console.log("📝 Marking token as used:", token.substring(0, 10) + "...")
      
      const { error } = await supabaseAdmin
        .from("payment_records")
        .update({ 
          token_used: true,
          updated_at: new Date().toISOString()
        })
        .eq("signup_token", token)

      if (error) {
        console.error("❌ Error marking token as used:", error.message)
        return false
      }

      console.log("✅ Token marked as used")
      return true
    } catch (error) {
      console.error("💥 Error marking token as used:", error)
      return false
    }
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log("🔍 Getting user by email:", email)
      const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("❌ User not found:", email)
          return null
        }
        console.error("❌ Error getting user by email:", error.message)
        return null
      }

      console.log("✅ User found:", email)
      return data
    } catch (error) {
      console.error("💥 Error getting user by email:", error)
      return null
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      console.log("🔍 Getting user by ID:", id)
      const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("❌ User not found:", id)
          return null
        }
        console.error("❌ Error getting user by ID:", error.message)
        return null
      }

      console.log("✅ User found by ID:", id)
      return data
    } catch (error) {
      console.error("💥 Error getting user by ID:", error)
      return null
    }
  }

  async createUser(userData: {
    email: string
    name: string
    password: string
    role: string
    planId?: string
    stripeSessionId?: string
  }): Promise<User | null> {
    try {
      console.log("👤 Creating new user:", userData.email)
      
      const hashedPassword = await this.hashPassword(userData.password)

      // Define plan details
      const planDetails = {
        basic: {
          name: "Basic Plan",
          price: 45,
          type: "per-video",
          features: ["1 video edit", "48-hour turnaround", "2 revisions", "Frame.io review", "QC included"],
          maxProjects: 1,
          maxRevisions: 2
        },
        monthly_pass: {
          name: "Monthly Pass",
          price: 350,
          type: "monthly",
          features: ["10 videos/month", "48-hour turnaround", "2 revisions per video", "Priority support", "Project manager"],
          maxProjects: 10,
          maxRevisions: 2
        },
        premium: {
          name: "Premium Plan",
          price: 500,
          type: "per-video",
          features: ["1 premium edit", "3-4 day turnaround", "2 revisions", "Advanced color grading", "Motion graphics"],
          maxProjects: 1,
          maxRevisions: 2
        },
        ultimate: {
          name: "Ultimate Plan",
          price: 999,
          type: "monthly",
          features: ["1 project/day", "24-hour turnaround", "Unlimited revisions", "Dedicated team", "24/7 support"],
          maxProjects: -1, // Unlimited
          maxRevisions: -1 // Unlimited
        }
      }

      const plan = planDetails[userData.planId as keyof typeof planDetails] || planDetails.basic

      const { data, error } = await supabaseAdmin
        .from("users")
        .insert({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          plan_id: userData.planId || 'basic',
          plan_name: plan.name,
          plan_price: plan.price,
          plan_type: plan.type,
          plan_features: plan.features,
          max_projects: plan.maxProjects,
          max_revisions: plan.maxRevisions,
          stripe_session_id: userData.stripeSessionId,
          is_active: true,
          avatar: "/placeholder-user.jpg",
          active_projects: 0,
          total_spent: 0,
          member_since: new Date().toLocaleDateString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error creating user:", error.message)
        return null
      }

      console.log("✅ User created successfully:", userData.email)
      return data
    } catch (error) {
      console.error("💥 Error creating user:", error)
      return null
    }
  }

  async getAllEditors(): Promise<User[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("role", "employee")
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("❌ Error getting editors:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error("💥 Error getting editors:", error)
      return []
    }
  }

  async getAllQCPersonnel(): Promise<User[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("role", "qc")
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("❌ Error getting QC personnel:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error("💥 Error getting QC personnel:", error)
      return []
    }
  }

  // Project operations
  async createProject(projectData: {
    title: string
    description?: string
    googleDriveLink: string
    requirements?: string
    clientId: string
    frameioProjectId: string
    status: string
    createdAt: string
  }): Promise<Project | null> {
    try {
      console.log("📝 Creating new project:", projectData.title)
      
      const { data, error } = await supabaseAdmin
        .from("projects")
        .insert({
          title: projectData.title,
          description: projectData.description,
          google_drive_link: projectData.googleDriveLink,
          requirements: projectData.requirements,
          client_id: projectData.clientId,
          frameio_project_id: projectData.frameioProjectId,
          status: projectData.status,
          progress: 0,
          revisions: 0,
          max_revisions: 2, // Default based on plan
          created_at: projectData.createdAt,
          updated_at: projectData.createdAt
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error creating project:", error.message)
        return null
      }

      console.log("✅ Project created successfully:", projectData.title)
      return data
    } catch (error) {
      console.error("💥 Error creating project:", error)
      return null
    }
  }

  async getActiveProjectsByUserId(userId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select("*")
        .eq("client_id", userId)
        .in("status", ["pending", "assigned", "in_progress", "qc_review", "client_review"])
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error getting active projects:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error("💥 Error getting active projects:", error)
      return []
    }
  }

  async getProjectsByUserId(userId: string, role: string): Promise<Project[]> {
    try {
      console.log("🔍 Getting projects for user:", userId, "role:", role)
      let query = supabaseAdmin.from("projects").select("*")

      if (role === "client") {
        query = query.eq("client_id", userId)
      } else if (role === "employee") {
        query = query.eq("assigned_editor_id", userId).not("assigned_editor_id", "is", null)
      } else if (role === "qc") {
        query = query.eq("assigned_qc_id", userId).not("assigned_qc_id", "is", null)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error getting projects:", error.message)
        return []
      }

      console.log("✅ Found projects:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("💥 Error getting projects:", error)
      return []
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabaseAdmin.from("projects").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error getting all projects:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error("💥 Error getting all projects:", error)
      return []
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabaseAdmin.from("projects").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") return null
        console.error("❌ Error getting project by ID:", error.message)
        return null
      }

      return data
    } catch (error) {
      console.error("💥 Error getting project by ID:", error)
      return null
    }
  }

  async assignProjectToEditor(projectId: string, editorId: string, assignedBy: string): Promise<boolean> {
    try {
      console.log("📝 Assigning project to editor:", projectId, "->", editorId)

      const { error } = await supabaseAdmin
        .from("projects")
        .update({
          assigned_editor_id: editorId,
          status: "assigned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)

      if (error) {
        console.error("❌ Error assigning project:", error.message)
        return false
      }

      // Create assignment record
      await supabaseAdmin.from("project_assignments").insert({
        project_id: projectId,
        assigned_by: assignedBy,
        assigned_to: editorId,
        role_type: "editor"
      })

      // Create activity log
      await this.createProjectActivity({
        project_id: projectId,
        user_id: assignedBy,
        action: "assigned",
        details: `Project assigned to editor`,
        metadata: { editor_id: editorId },
      })

      // Send notification to editor
      const editor = await this.getUserById(editorId)
      if (editor) {
        await this.createNotification({
          user_id: editorId,
          title: "New Project Assigned",
          message: `You have been assigned a new project to work on.`,
          type: "project_update",
          project_id: projectId,
        })
      }

      console.log("✅ Project assigned successfully")
      return true
    } catch (error) {
      console.error("💥 Error assigning project:", error)
      return false
    }
  }

  async assignProjectToQC(projectId: string, qcId: string, assignedBy: string): Promise<boolean> {
    try {
      console.log("📝 Assigning project to QC:", projectId, "->", qcId)

      const { error } = await supabaseAdmin
        .from("projects")
        .update({
          assigned_qc_id: qcId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)

      if (error) {
        console.error("❌ Error assigning project to QC:", error.message)
        return false
      }

      // Create assignment record
      await supabaseAdmin.from("project_assignments").insert({
        project_id: projectId,
        assigned_by: assignedBy,
        assigned_to: qcId,
        role_type: "qc"
      })

      // Create activity log
      await this.createProjectActivity({
        project_id: projectId,
        user_id: assignedBy,
        action: "assigned",
        details: `Project assigned to QC`,
        metadata: { qc_id: qcId },
      })

      // Send notification to QC
      const qc = await this.getUserById(qcId)
      if (qc) {
        await this.createNotification({
          user_id: qcId,
          title: "New Project for QC Review",
          message: `You have been assigned a new project for quality control review.`,
          type: "project_update",
          project_id: projectId,
        })
      }

      console.log("✅ Project assigned to QC successfully")
      return true
    } catch (error) {
      console.error("💥 Error assigning project to QC:", error)
      return false
    }
  }

  async updateProjectProgress(projectId: string, progress: number, updatedBy: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from("projects")
        .update({
          progress,
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId)

      if (error) {
        console.error("❌ Error updating project progress:", error.message)
        return false
      }

      // Create activity log
      await this.createProjectActivity({
        project_id: projectId,
        user_id: updatedBy,
        action: "progress_updated",
        details: `Progress updated to ${progress}%`,
        metadata: { progress },
      })

      return true
    } catch (error) {
      console.error("💥 Error updating project progress:", error)
      return false
    }
  }

  async updateProjectStatus(projectId: string, status: string, updatedBy: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from("projects")
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId)

      if (error) {
        console.error("❌ Error updating project status:", error.message)
        return false
      }

      // Create activity log
      await this.createProjectActivity({
        project_id: projectId,
        user_id: updatedBy,
        action: "status_changed",
        details: `Status changed to ${status}`,
        metadata: { status },
      })

      return true
    } catch (error) {
      console.error("💥 Error updating project status:", error)
      return false
    }
  }

  // Editor Tasks Management
  async getEditorTasks(editorId: string): Promise<EditorTask[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("editor_tasks")
        .select("*")
        .eq("editor_id", editorId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error getting editor tasks:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error("💥 Error getting editor tasks:", error)
      return []
    }
  }

  async createEditorTask(task: Omit<EditorTask, "id" | "created_at" | "updated_at">): Promise<EditorTask | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("editor_tasks")
        .insert([{
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error("❌ Error creating editor task:", error.message)
        return null
      }

      return data
    } catch (error) {
      console.error("💥 Error creating editor task:", error)
      return null
    }
  }

  async updateEditorTask(taskId: string, updates: Partial<EditorTask>): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from("editor_tasks")
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", taskId)

      if (error) {
        console.error("❌ Error updating editor task:", error.message)
        return false
      }

      return true
    } catch (error) {
      console.error("💥 Error updating editor task:", error)
      return false
    }
  }

  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    try {
      console.log("🔍 Getting notifications for user:", userId)
      const { data, error } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error getting notifications:", error.message)
        return []
      }

      console.log("✅ Found notifications:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("💥 Error getting notifications:", error)
      return []
    }
  }

  async createNotification(notification: Omit<Notification, "id" | "created_at">): Promise<Notification | null> {
    try {
      console.log("📝 Creating notification for user:", notification.user_id)
      const { data, error } = await supabaseAdmin.from("notifications").insert([{
        ...notification,
        created_at: new Date().toISOString()
      }]).select().single()

      if (error) {
        console.error("❌ Error creating notification:", error.message)
        return null
      }

      console.log("✅ Notification created successfully")
      return data
    } catch (error) {
      console.error("💥 Error creating notification:", error)
      return null
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log("📝 Marking notification as read:", notificationId)
      const { error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) {
        console.error("❌ Error marking notification as read:", error.message)
        return false
      }

      console.log("✅ Notification marked as read")
      return true
    } catch (error) {
      console.error("💥 Error marking notification as read:", error)
      return false
    }
  }

  // Comment operations
  async createComment(comment: Omit<VideoComment, "id" | "created_at" | "updated_at">): Promise<VideoComment | null> {
    try {
      console.log("📝 Creating comment for project:", comment.project_id)
      const { data, error } = await supabaseAdmin.from("video_comments").insert([{
        ...comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]).select().single()

      if (error) {
        console.error("❌ Error creating comment:", error.message)
        return null
      }

      console.log("✅ Comment created successfully")
      return data
    } catch (error) {
      console.error("💥 Error creating comment:", error)
      return null
    }
  }

  async getCommentsByProjectId(projectId: string): Promise<VideoComment[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("video_comments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error getting comments:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error("💥 Error getting comments:", error)
      return []
    }
  }

  // Project Activity operations
  async createProjectActivity(activity: Omit<ProjectActivity, "id" | "created_at">): Promise<ProjectActivity | null> {
    try {
      const { data, error } = await supabaseAdmin.from("project_activities").insert([{
        ...activity,
        created_at: new Date().toISOString()
      }]).select().single()

      if (error) {
        console.error("❌ Error creating project activity:", error.message)
        return null
      }

      return data
    } catch (error) {
      console.error("💥 Error creating project activity:", error)
      return null
    }
  }

  async getProjectActivities(projectId: string): Promise<ProjectActivity[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("project_activities")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error getting project activities:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error("💥 Error getting project activities:", error)
      return []
    }
  }

  // User Settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      console.log("🔍 Getting user settings:", userId)
      const { data, error } = await supabaseAdmin.from("user_settings").select("*").eq("user_id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("❌ User settings not found, will create defaults")
          return null
        }
        console.error("❌ Error getting user settings:", error.message)
        return null
      }

      console.log("✅ User settings found")
      return data
    } catch (error) {
      console.error("💥 Error getting user settings:", error)
      return null
    }
  }

  async createDefaultUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      console.log("📝 Creating default user settings:", userId)
      const { data, error } = await supabaseAdmin
        .from("user_settings")
        .insert({
          user_id: userId,
          theme: "dark",
          language: "en",
          timezone: "UTC",
          email_notifications: true,
          push_notifications: true,
          comment_notifications: true,
          project_update_notifications: true,
          billing_notifications: false,
          profile_visible: true,
          activity_visible: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error creating default user settings:", error.message)
        return null
      }

      console.log("✅ Default user settings created")
      return data
    } catch (error) {
      console.error("💥 Error creating default user settings:", error)
      return null
    }
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    try {
      console.log("📝 Updating user settings:", userId)
      const { error } = await supabaseAdmin.from("user_settings").update({
        ...settings,
        updated_at: new Date().toISOString()
      }).eq("user_id", userId)

      if (error) {
        console.error("❌ Error updating user settings:", error.message)
        return false
      }

      console.log("✅ User settings updated")
      return true
    } catch (error) {
      console.error("💥 Error updating user settings:", error)
      return false
    }
  }

  // Authentication helpers
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      console.error("💥 Error verifying password:", error)
      return false
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 12)
    } catch (error) {
      console.error("💥 Error hashing password:", error)
      throw error
    }
  }
}
